import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../firebase/firebaseConfig';

export default function SmartMatching() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [insights, setInsights] = useState('');
  const auth = getAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const currentUserId = auth.currentUser?.uid;
      
      // Get current user data
      if (currentUserId) {
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const currentUserData = { id: currentUserId, ...currentUserDoc.data() };
        setCurrentUser(currentUserData);
        
        // Get all users except current user
        const allUsers = [];
        usersSnapshot.forEach((doc) => {
          if (doc.id !== currentUserId) {
            allUsers.push({ id: doc.id, ...doc.data() });
          }
        });
        
        // Calculate match scores and sort
        const usersWithScores = allUsers.map(user => {
          const matchResult = calculateMatchScore(currentUserData, user);
          if (matchResult === null) {
            return null; // No subject overlap, exclude this user
          }
          return {
            ...user,
            ...matchResult
          };
        }).filter(user => user !== null) // Remove users with no subject overlap
          .sort((a, b) => b.matchScore - a.matchScore);
        
        setUsers(usersWithScores);
        generateInsights(currentUserData, usersWithScores);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (currentUser, otherUser) => {
    let matchScore = 0;
    let matchReasons = [];
    
    // Get registered subjects (from signup)
    const userRegisteredSubjects = currentUser.subjects || [];
    const theirRegisteredSubjects = otherUser.subjects || [];
    
    // Get resource subjects (from uploads)
    const userResourceSubjects = currentUser.resourceSubjects || [];
    const theirResourceSubjects = otherUser.resourceSubjects || [];
    
    // Get all user's subjects (combination of registered and resource subjects)
    const userAllSubjects = [...new Set([...userRegisteredSubjects, ...userResourceSubjects])];
    const theirAllSubjects = [...new Set([...theirRegisteredSubjects, ...theirResourceSubjects])];
    
    // Check if there's any subject overlap - if not, return null to exclude this user
    const hasSubjectOverlap = userAllSubjects.some(subject => theirAllSubjects.includes(subject));
    if (!hasSubjectOverlap) {
      return null; // No common subjects, exclude this user
    }
    
    // Calculate registered subject overlap (higher priority)
    const registeredSubjectOverlap = userRegisteredSubjects.filter(subject => 
      theirRegisteredSubjects.includes(subject)
    );
    
    if (registeredSubjectOverlap.length > 0) {
      matchScore += registeredSubjectOverlap.length * 25; // Higher weight for registered subjects
      matchReasons.push(`Shared interests: ${registeredSubjectOverlap.join(', ')}`);
    }
    
    // Calculate resource subject overlap (lower priority)
    const resourceSubjectOverlap = userResourceSubjects.filter(subject => 
      theirResourceSubjects.includes(subject)
    );
    
    if (resourceSubjectOverlap.length > 0) {
      matchScore += resourceSubjectOverlap.length * 15; // Lower weight for resource subjects
      matchReasons.push(`Shared study materials: ${resourceSubjectOverlap.join(', ')}`);
    }
    
    // Calculate cross-category overlap (registered vs resource)
    const crossOverlap1 = userRegisteredSubjects.filter(subject => 
      theirResourceSubjects.includes(subject)
    );
    const crossOverlap2 = userResourceSubjects.filter(subject => 
      theirRegisteredSubjects.includes(subject)
    );
    
    if (crossOverlap1.length > 0) {
      matchScore += crossOverlap1.length * 20;
      matchReasons.push(`Your interests match their resources: ${crossOverlap1.join(', ')}`);
    }
    
    if (crossOverlap2.length > 0) {
      matchScore += crossOverlap2.length * 20;
      matchReasons.push(`Your resources match their interests: ${crossOverlap2.join(', ')}`);
    }
    
    // Expertise level compatibility
    const userLevel = currentUser.expertise || 'Beginner';
    const theirLevel = otherUser.expertise || 'Beginner';
    
    if (userLevel === theirLevel) {
      matchScore += 20;
      matchReasons.push(`Same expertise level: ${userLevel}`);
    } else {
      // Complementary levels (beginner-intermediate, intermediate-advanced)
      const levels = ['Beginner', 'Intermediate', 'Advanced'];
      const userIndex = levels.indexOf(userLevel);
      const theirIndex = levels.indexOf(theirLevel);
      
      if (Math.abs(userIndex - theirIndex) === 1) {
        matchScore += 15;
        matchReasons.push(`Complementary expertise levels`);
      }
    }
    
    // Location proximity
    if (currentUser.location && otherUser.location && 
        currentUser.location.toLowerCase() === otherUser.location.toLowerCase()) {
      matchScore += 10;
      matchReasons.push(`Same location: ${currentUser.location}`);
    }
    
    // Activity level
    const userResourceCount = (currentUser.uploadedResources || []).length;
    const theirResourceCount = (otherUser.uploadedResources || []).length;
    
    if (userResourceCount > 0 && theirResourceCount > 0) {
      matchScore += 5;
      matchReasons.push('Both active contributors');
    }
    
    return {
      matchScore: Math.max(matchScore, 1), // Minimum score of 1
      matchReasons,
      registeredSubjects: theirRegisteredSubjects,
      resourceSubjects: theirResourceSubjects
    };
  };

  const generateInsights = (currentUser, matchedUsers) => {
    const userRegisteredSubjects = currentUser.subjects || [];
    const userResourceSubjects = currentUser.resourceSubjects || [];
    const userAllSubjects = [...new Set([...userRegisteredSubjects, ...userResourceSubjects])];
    const topMatches = matchedUsers.slice(0, 3);
    
    let insightText = `🎯 Based on your subjects (${userAllSubjects.join(', ')}), `;
    
    if (topMatches.length > 0) {
      const commonInterests = [...new Set([...(topMatches[0].registeredSubjects || []), ...(topMatches[0].resourceSubjects || [])])];
      const sharedSubjects = userAllSubjects.filter(subject => 
        commonInterests.includes(subject)
      );
      
      if (sharedSubjects.length > 0) {
        insightText += `you have ${matchedUsers.length} matches with shared subjects in ${sharedSubjects.join(', ')}. `;
      }
      
      insightText += `Your top match has a ${topMatches[0].matchScore}% compatibility score!`;
    } else {
      insightText += 'no matches found. Try adding more subjects to your profile or uploading resources in different subjects to find study partners!';
    }
    
    setInsights(insightText);
  };

  const sendConnectionRequest = async () => {
    if (!selectedUser || !connectionMessage.trim()) {
      Alert.alert('Error', 'Please enter a connection message');
      return;
    }
    
    try {
      const connectionData = {
        fromUserId: auth.currentUser.uid,
        toUserId: selectedUser.id,
        fromUserName: currentUser.name || 'Anonymous',
        toUserName: selectedUser.name || 'Anonymous',
        message: connectionMessage,
        status: 'pending',
        createdAt: new Date(),
        matchScore: selectedUser.matchScore,
        sharedSubjects: selectedUser.registeredSubjects.filter(subject => 
          (currentUser.subjects || []).includes(subject)
        )
      };
      
      await addDoc(collection(db, 'connections'), connectionData);
      
      // Add notification to the recipient
      const notificationData = {
        userId: selectedUser.id,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${currentUser.name || 'Someone'} wants to connect with you`,
        read: false,
        createdAt: new Date(),
        data: { connectionId: selectedUser.id }
      };
      
      await addDoc(collection(db, 'notifications'), notificationData);
      
      Alert.alert('Success', 'Connection request sent!');
      setModalVisible(false);
      setConnectionMessage('');
      setSelectedUser(null);
      
    } catch (error) {
      console.error('Error sending connection request:', error);
      Alert.alert('Error', 'Failed to send connection request');
    }
  };

  const renderSubjectTags = (registeredSubjects, resourceSubjects) => {
    const allSubjects = [...new Set([...(registeredSubjects || []), ...(resourceSubjects || [])])];
    
    return (
      <View style={styles.subjectContainer}>
        {(registeredSubjects || []).map((subject, index) => (
          <View key={`reg-${index}`} style={[styles.subjectTag, styles.registeredSubjectTag]}>
            <Text style={styles.registeredSubjectText}>{subject}</Text>
            <Ionicons name="person" size={12} color="#059669" style={styles.subjectIcon} />
          </View>
        ))}
        {(resourceSubjects || []).filter(subject => !(registeredSubjects || []).includes(subject)).map((subject, index) => (
          <View key={`res-${index}`} style={[styles.subjectTag, styles.resourceSubjectTag]}>
            <Text style={styles.resourceSubjectText}>{subject}</Text>
            <Ionicons name="library" size={12} color="#2563eb" style={styles.subjectIcon} />
          </View>
        ))}
      </View>
    );
  };

  const renderMatchCard = (user) => (
    <View key={user.id} style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || 'Anonymous User'}</Text>
          <Text style={styles.userLocation}>
            <Ionicons name="location" size={14} color="#6b7280" />
            {user.location || 'Location not specified'}
          </Text>
          <Text style={styles.userExpertise}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            {user.expertise || 'Beginner'}
          </Text>
        </View>
        <View style={styles.matchScoreContainer}>
          <Text style={styles.matchScore}>{user.matchScore}%</Text>
          <Text style={styles.matchLabel}>Match</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Registered Interests:</Text>
      {renderSubjectTags(user.registeredSubjects, user.resourceSubjects)}
      
      {user.matchReasons && user.matchReasons.length > 0 && (
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Why you match:</Text>
          {user.matchReasons.map((reason, index) => (
            <Text key={index} style={styles.reasonText}>• {reason}</Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.connectButton}
        onPress={() => {
          setSelectedUser(user);
          setModalVisible(true);
        }}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Finding your perfect study matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8b5cf6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🤖 Smart Matching</Text>
      </View>
      
      {insights ? (
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsText}>{insights}</Text>
        </View>
      ) : null}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {users.length > 0 ? (
          users.map(renderMatchCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Subject Matches Found</Text>
            <Text style={styles.emptySubtitle}>
              No users found with matching subjects. Try:
              {"\n"}• Adding more subjects to your profile
              {"\n"}• Uploading resources in different subjects
              {"\n"}• Checking back later for new users
            </Text>
          </View>
        )}
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect with {selectedUser?.name}</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Send a personalized message to start your study partnership:
            </Text>
            
            <TextInput
              style={styles.messageInput}
              placeholder="Hi! I'd love to study together and share resources..."
              value={connectionMessage}
              onChangeText={setConnectionMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={sendConnectionRequest}
              >
                <Text style={styles.sendButtonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  insightsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  insightsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userExpertise: {
    fontSize: 14,
    color: '#6b7280',
  },
  matchScoreContainer: {
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 8,
    minWidth: 60,
  },
  matchScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  matchLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  subjectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  registeredSubjectTag: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  resourceSubjectTag: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  registeredSubjectText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  resourceSubjectText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  subjectIcon: {
    marginLeft: 4,
  },
  reasonsContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 0.45,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  sendButton: {
    flex: 0.45,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});