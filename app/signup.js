import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { auth, db } from "../firebase/firebaseConfig";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [subjects, setSubjects] = useState("");
  const [expertiseLevel, setExpertiseLevel] = useState("beginner");
  const [isTutor, setIsTutor] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        fullName: fullName,
        subjects: subjects.split(",").map(s => s.trim()).filter(s => s),
        expertiseLevel: expertiseLevel,
        isTutor: isTutor,
        rating: 0,
        studentsCount: 0,
        createdAt: new Date(),
        profileComplete: true
      });

      router.replace("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="school" size={48} color="#007AFF" />
          <Text style={styles.title}>Join StudyPro</Text>
          <Text style={styles.subtitle}>Connect with fellow learners</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.label}>Subjects (comma separated)</Text>
          <TextInput
            placeholder="e.g., Mathematics, Physics, Chemistry"
            value={subjects}
            onChangeText={setSubjects}
            style={styles.input}
          />

          <Text style={styles.label}>Expertise Level</Text>
          <View style={styles.levelContainer}>
            {["beginner", "intermediate", "advanced"].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  expertiseLevel === level && styles.selectedLevel
                ]}
                onPress={() => setExpertiseLevel(level)}
              >
                <Text style={[
                  styles.levelText,
                  expertiseLevel === level && styles.selectedLevelText
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.tutorToggle}
            onPress={() => setIsTutor(!isTutor)}
          >
            <Ionicons
              name={isTutor ? "checkbox" : "square-outline"}
              size={24}
              color="#007AFF"
            />
            <Text style={styles.tutorText}>I want to offer tutoring</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => router.push("/signin")}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.linkText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  levelContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  selectedLevel: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  levelText: {
    fontSize: 14,
    color: "#666",
  },
  selectedLevelText: {
    color: "white",
    fontWeight: "600",
  },
  tutorToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  tutorText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  signUpButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  signInLink: {
    alignItems: "center",
  },
  signInText: {
    fontSize: 16,
    color: "#666",
  },
  linkText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  errorText: {
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
});
