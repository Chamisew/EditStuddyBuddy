import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";

export default function QuizScreen() {
  const { id, edit } = useLocalSearchParams();
  const router = useRouter();
  const uid = auth.currentUser?.uid;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // qid -> Set indices
  const [isTutor, setIsTutor] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const run = async () => {
      try {
        const me = await getDoc(doc(db, 'users', uid));
        const profile = me.exists() ? me.data() : {};
        setIsTutor(!!profile.isTutor);
        const qd = await getDoc(doc(db, 'quizzes', String(id)));
        if (qd.exists()) setQuiz({ id: qd.id, ...qd.data() });
        if (profile.isTutor) {
          const ss = await getDocs(collection(db, 'quizzes', String(id), 'submissions'));
          const list = [];
          for (const d of ss.docs) {
            const sub = d.data();
            const uDoc = await getDoc(doc(db, 'users', sub.userId));
            const name = uDoc.exists() ? (uDoc.data().fullName || uDoc.data().email || sub.userId) : sub.userId;
            list.push({ id: d.id, name, ...sub });
          }
          setSubmissions(list);
        } else {
          // load my previous submission to show results
          try {
            const mine = await getDoc(doc(db, 'quizzes', String(id), 'submissions', uid));
            if (mine.exists()) {
              const d = mine.data();
              setAnswers(d.answers || {});
              setScore(d.score || 0);
              setShowResults(true);
            }
          } catch {}
        }
      } catch {}
    };
    if (uid && id) run();
  }, [uid, id]);

  const toggleAnswer = (qid, idx, multi) => {
    setAnswers(prev => {
      const cur = new Set(prev[qid] || []);
      if (multi) {
        if (cur.has(idx)) cur.delete(idx); else cur.add(idx);
        return { ...prev, [qid]: Array.from(cur) };
      } else {
        return { ...prev, [qid]: [idx] };
      }
    });
  };

  const grade = (q, ans) => {
    const correct = new Set(q.correct || []);
    const chosen = new Set(ans || []);
    if (correct.size !== chosen.size) return 0;
    for (const i of correct) if (!chosen.has(i)) return 0;
    return 1;
  };

  const submit = async () => {
    try {
      if (!quiz?.published) { Alert.alert('Not published', 'This quiz is not published yet'); return; }
      const results = quiz.questions.map((q) => grade(q, answers[q.id]));
      const total = results.reduce((a,b)=>a+b,0);
      await setDoc(doc(db, 'quizzes', quiz.id, 'submissions', uid), {
        userId: uid,
        answers,
        score: total,
        max: quiz.questions.length,
        submittedAt: serverTimestamp(),
      }, { merge: true });
      setScore(total);
      setShowResults(true);
      Alert.alert('Submitted', `Score ${total}/${quiz.questions.length}`);
    } catch {
      Alert.alert('Error', 'Failed to submit');
    }
  };

  const publishToggle = async () => {
    try {
      await updateDoc(doc(db, 'quizzes', quiz.id), { published: !quiz.published });
      setQuiz(q => ({ ...q, published: !q.published }));
    } catch {}
  };

  const saveTitle = async (title) => {
    try { await updateDoc(doc(db, 'quizzes', quiz.id), { title }); setQuiz(q => ({ ...q, title })); } catch {}
  };

  const saveDescription = async (description) => {
    try { await updateDoc(doc(db, 'quizzes', quiz.id), { description }); setQuiz(q => ({ ...q, description })); } catch {}
  };

  const updateQuestions = async (nextQuestions) => {
    try { await updateDoc(doc(db, 'quizzes', quiz.id), { questions: nextQuestions }); setQuiz(q => ({ ...q, questions: nextQuestions })); } catch {}
  };

  const addSingle = async () => {
    try {
      const next = {
        ...quiz,
        questions: [...(quiz.questions||[]), { id: `q${Date.now()}`, type: 'single', text: 'New question', options: ['Option 1','Option 2'], correct: [0] }]
      };
      await updateQuestions(next.questions);
    } catch {}
  };

  const addMulti = async () => {
    try {
      const next = {
        ...quiz,
        questions: [...(quiz.questions||[]), { id: `q${Date.now()}`, type: 'multi', text: 'New multi question', options: ['A','B','C'], correct: [0,1] }]
      };
      await updateQuestions(next.questions);
    } catch {}
  };

  const editQuestionText = async (qid, text) => {
    const next = (quiz.questions||[]).map(q => q.id === qid ? { ...q, text } : q);
    await updateQuestions(next);
  };

  const toggleType = async (qid) => {
    const next = (quiz.questions||[]).map(q => {
      if (q.id !== qid) return q;
      const newType = q.type === 'single' ? 'multi' : 'single';
      const newCorrect = newType === 'single' ? (q.correct && q.correct.length ? [q.correct[0]] : []) : (q.correct || []);
      return { ...q, type: newType, correct: newCorrect };
    });
    await updateQuestions(next);
  };

  const addOption = async (qid) => {
    const next = (quiz.questions||[]).map(q => q.id === qid ? { ...q, options: [...(q.options||[]), ""] } : q);
    await updateQuestions(next);
  };

  const editOptionText = async (qid, idx, text) => {
    const next = (quiz.questions||[]).map(q => {
      if (q.id !== qid) return q;
      const opts = [...(q.options||[])];
      opts[idx] = text;
      return { ...q, options: opts };
    });
    await updateQuestions(next);
  };

  const removeOption = async (qid, idx) => {
    const next = (quiz.questions||[]).map(q => {
      if (q.id !== qid) return q;
      const opts = (q.options||[]).filter((_,i)=>i!==idx);
      const correct = (q.correct||[]).filter(i=>i!==idx).map(i=> i > idx ? i-1 : i);
      return { ...q, options: opts, correct };
    });
    await updateQuestions(next);
  };

  const toggleCorrectEdit = async (qid, idx) => {
    const next = (quiz.questions||[]).map(q => {
      if (q.id !== qid) return q;
      const multi = q.type === 'multi';
      const cur = new Set(q.correct || []);
      if (multi) { cur.has(idx) ? cur.delete(idx) : cur.add(idx); }
      else { return { ...q, correct: [idx] }; }
      return { ...q, correct: Array.from(cur) };
    });
    await updateQuestions(next);
  };

  const removeQuestion = async (qid) => {
    const next = (quiz.questions||[]).filter(q => q.id !== qid);
    await updateQuestions(next);
  };

  if (!quiz) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={{ padding: 16 }}>
        <Text>Loading...</Text>
      </View>
    </SafeAreaView>
  );

  const editable = isTutor && edit === '1' && quiz.ownerId === uid;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quiz.title || 'Quiz'}</Text>
        {isTutor && quiz.ownerId === uid ? (
          <TouchableOpacity onPress={publishToggle}>
            <Ionicons name={quiz.published ? 'cloud-done' : 'cloud-upload'} size={24} color={quiz.published ? '#34C759' : '#007AFF'} />
          </TouchableOpacity>
        ) : <View style={{ width: 24 }} />}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {editable && (
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={styles.input}
              placeholder="Quiz title"
              value={quiz.title || ''}
              onChangeText={saveTitle}
            />
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Description"
              value={quiz.description || ''}
              onChangeText={saveDescription}
            />
          </View>
        )}
        {editable && (
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <TouchableOpacity style={styles.smallBtn} onPress={addSingle}><Text style={styles.smallBtnText}>Add radio</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={addMulti}><Text style={styles.smallBtnText}>Add checkbox</Text></TouchableOpacity>
          </View>
        )}

        {(quiz.questions||[]).map((q) => (
          <View key={q.id} style={styles.qcard}>
            {editable ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                <TextInput style={[styles.input, { flex: 1 }]} value={q.text} onChangeText={(t)=>editQuestionText(q.id, t)} />
                <TouchableOpacity onPress={() => toggleType(q.id)} style={{ marginLeft: 8 }}>
                  <Ionicons name={q.type === 'multi' ? 'checkbox' : 'radio-button-on'} size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeQuestion(q.id)} style={{ marginLeft: 8 }}>
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.qtext}>{q.text}</Text>
            )}
            {(q.options||[]).map((opt, idx) => {
              const multi = q.type === 'multi';
              if (editable) {
                const isCorrect = new Set(q.correct||[]).has(idx);
                return (
                  <View key={idx} style={[styles.opt, { alignItems: 'center' }] }>
                    <TouchableOpacity onPress={() => toggleCorrectEdit(q.id, idx)}>
                      <Ionicons name={multi ? (isCorrect ? 'checkbox' : 'square-outline') : (isCorrect ? 'radio-button-on' : 'radio-button-off')} size={20} color={isCorrect ? '#34C759' : '#888'} />
                    </TouchableOpacity>
                    <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} value={opt} onChangeText={(t)=>editOptionText(q.id, idx, t)} />
                    <TouchableOpacity onPress={() => removeOption(q.id, idx)} style={{ marginLeft: 8 }}>
                      <Ionicons name="close-circle" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                );
              } else {
                const chosen = new Set(answers[q.id]||[]).has(idx);
                const isCorrect = new Set(q.correct||[]).has(idx);
                const show = showResults;
                const icon = multi
                  ? (chosen ? 'checkbox' : 'square-outline')
                  : (chosen ? 'radio-button-on' : 'radio-button-off');
                let color = chosen ? '#007AFF' : '#888';
                if (show) {
                  if (isCorrect) color = '#34C759';
                  else if (chosen && !isCorrect) color = '#ff3b30';
                }
                const Content = (
                  <>
                    <Ionicons name={icon} size={20} color={color} />
                    <Text style={[styles.optText, show && isCorrect ? { color: '#34C759', fontWeight: '600' } : null]}>{opt}</Text>
                    {show && chosen && (isCorrect ? (
                      <Ionicons name="checkmark-circle" size={18} color="#34C759" style={{ marginLeft: 8 }} />
                    ) : (
                      <Ionicons name="close-circle" size={18} color="#ff3b30" style={{ marginLeft: 8 }} />
                    ))}
                  </>
                );
                if (show) {
                  return (
                    <View key={idx} style={styles.opt}>
                      {Content}
                    </View>
                  );
                }
                return (
                  <TouchableOpacity key={idx} style={styles.opt} onPress={() => toggleAnswer(q.id, idx, multi)}>
                    {Content}
                  </TouchableOpacity>
                );
              }
            })}
            {editable && (
              <TouchableOpacity onPress={() => addOption(q.id)} style={[styles.smallBtn, { alignSelf: 'flex-start', marginTop: 8 }]}>
                <Text style={styles.smallBtnText}>Add option</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {quiz.published && !showResults && (quiz.ownerId !== uid) && (
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        )}

        {showResults && (
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <Text style={{ fontWeight: '700' }}>Score: {score}/{(quiz.questions||[]).length}</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>Green = correct, Red = your incorrect choices</Text>
            {quiz.published && (quiz.ownerId !== uid) && (
              <TouchableOpacity style={[styles.submitBtn, { marginTop: 12, backgroundColor: '#ff3b30' }]} onPress={async () => {
                try {
                  await setDoc(doc(db, 'quizzes', quiz.id, 'submissions', uid), {}, { merge: false });
                } catch {}
                // delete the submission to allow retake
                try { await setDoc(doc(db, 'quizzes', quiz.id, 'submissions', uid), null); } catch {}
              }} disabled>
                <Text style={styles.submitText}>Retake (ask me to enable)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isTutor && submissions.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Submissions</Text>
            {submissions.map(s => (
              <View key={s.id} style={styles.subCard}>
                <Text style={styles.subName}>{s.name}</Text>
                <Text style={styles.subScore}>{s.score}/{s.max}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  qcard: { backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 12 },
  qtext: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  opt: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  optText: { marginLeft: 8, fontSize: 15 },
  meta: { marginTop: 8, color: '#666' },
  smallBtn: { backgroundColor: '#EAF2FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallBtnText: { color: '#007AFF', fontWeight: '600' },
  submitBtn: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: '700' },
  subCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 8 },
  subName: { fontWeight: '600' },
  subScore: { color: '#007AFF', fontWeight: '700' },
});

