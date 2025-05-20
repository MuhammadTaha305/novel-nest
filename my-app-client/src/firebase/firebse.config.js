
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDth1Ym8i9QA69VpOK6mlh-SRzaxQ_mkf8",
  authDomain: "novel-nest-80684.firebaseapp.com",
  projectId: "novel-nest-80684",
  storageBucket: "novel-nest-80684.firebasestorage.app",
  messagingSenderId: "958890147814",
  appId: "1:958890147814:web:20443fcd925b7d7a01e027",
  measurementId: "G-DFRHXJ2S92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;
export { analytics };