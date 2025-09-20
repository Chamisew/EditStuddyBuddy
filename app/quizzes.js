import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";

export default function QuizzesScreen() {
  const router = useRouter();
  const [isTutor, setIsTutor] = useState(false);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!uid) return;
    let unsub = () => {};
    (async () => {
      try {
        const me = await getDoc(doc(db, 'users', uid));
        const profile = me.exists() ? me.data() : {};
        const tutor = !!profile.isTutor;
        setIsTutor(tutor);
        if (tutor) {
          const q = query(collection(db, 'quizzes'), where('ownerId','==', uid));
          unsub = onSnapshot(q, async (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const withNames = await Promise.all(items.map(async (it) => {
              try {
                const u = await getDoc(doc(db, 'users', it.ownerId));
                const ownerName = u.exists() ? (u.data().fullName || u.data().email || it.ownerId) : it.ownerId;
                return { ...it, ownerName };
              } catch { return { ...it, ownerName: it.ownerId }; }
            }));
            withNames.sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            setMyQuizzes(withNames);
          }, (error) => {
            Alert.alert('Error', error?.message || 'Failed to load quizzes');
          });
        } else {
          const q = query(collection(db, 'quizzes'), where('published','==', true));
          unsub = onSnapshot(q, async (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const withNames = await Promise.all(items.map(async (it) => {
              try {
                const u = await getDoc(doc(db, 'users', it.ownerId));
                const ownerName = u.exists() ? (u.data().fullName || u.data().email || it.ownerId) : it.ownerId;
                return { ...it, ownerName };
              } catch { return { ...it, ownerName: it.ownerId }; }
            }));
            withNames.sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

            // Per-quiz submission existence check for this user
            const annotated = await Promise.all(withNames.map(async (qz) => {
              try {
                const mine = await getDoc(doc(db, 'quizzes', qz.id, 'submissions', uid));
                return { ...qz, userDone: mine.exists() };
              } catch {
                return { ...qz, userDone: false };
              }
            }));
            setAvailableQuizzes(annotated);
          }, (error) => {
            Alert.alert('Error', error?.message || 'Failed to load quizzes');
          });
        }
      } catch (e) { Alert.alert('Error', e?.message || 'Failed to load quizzes'); }
    })();
    return () => { try { unsub(); } catch {} };
  }, [uid]);

  const createQuickQuiz = async () => {
    try {
      if (!isTutor || !uid) return;
      const qref = await addDoc(collection(db, 'quizzes'), {
        ownerId: uid,
        title: 'Untitled Quiz',
        description: '',
        published: false,
        createdAt: serverTimestamp(),
        questions: [
          { id: 'q1', type: 'single', text: 'Sample single choice?', options: ['A','B','C'], correct: [0] },
          { id: 'q2', type: 'multi', text: 'Sample multiple choice?', options: ['X','Y','Z'], correct: [0,2] },
        ],
      });
      router.push({ pathname: '/quiz', params: { id: qref.id, edit: '1' } });
    } catch (e) {
      Alert.alert('Error', 'Failed to create quiz');
    }
  };

  const deleteQuiz = async (quizId) => {
    try {
      if (!uid) return;
      const quizRef = doc(db, 'quizzes', quizId);
      const snap = await getDoc(quizRef);
      if (!snap.exists()) {
        Alert.alert('Already removed', 'This quiz no longer exists.');
        return;
      }
      const data = snap.data();
      if (data.ownerId !== uid) {
        Alert.alert('Not allowed', 'Only the owner can delete this quiz.');
        return;
      }
      // delete submissions
      const subs = await getDocs(collection(db, 'quizzes', quizId, 'submissions'));
      const deleteSubmissionPromises = subs.docs.map((d) => deleteDoc(doc(db, 'quizzes', quizId, 'submissions', d.id)));
      await Promise.allSettled(deleteSubmissionPromises);
      // delete quiz doc
      await deleteDoc(quizRef);
      // optimistic removal from lists
      setMyQuizzes(prev => prev.filter(q => q.id !== quizId));
      setAvailableQuizzes(prev => prev.filter(q => q.id !== quizId));
      Alert.alert('Deleted', 'Quiz has been deleted.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to delete quiz');
    }
  };

  const renderQuiz = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push({ pathname: '/quiz', params: { id: item.id } })}>
        <Text style={styles.title}>{item.title || 'Quiz'}</Text>
        <Text style={styles.meta}>{item.published ? 'Published' : 'Draft'} • by {item.ownerName || item.ownerId}{(!isTutor && item.userDone !== undefined) ? (item.userDone ? ' • Done' : ' • Not done') : ''}</Text>
      </TouchableOpacity>
      {item.ownerId === uid && (
        <TouchableOpacity onPress={() => deleteQuiz(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#ff3b30" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quizzes</Text>
        {isTutor ? (
          <TouchableOpacity onPress={createQuickQuiz}>
            <Ionicons name="add-circle" size={26} color="#007AFF" />
          </TouchableOpacity>
        ) : <View style={{ width: 26 }} />}
      </View>

      {isTutor ? (
        <FlatList data={myQuizzes} renderItem={renderQuiz} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16 }} />
      ) : (
        <FlatList data={availableQuizzes} renderItem={renderQuiz} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16 }} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  card: { backgroundColor: 'white', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { marginTop: 6, color: '#666' },
});

