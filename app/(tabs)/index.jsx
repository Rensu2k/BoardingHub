import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

import { auth } from "@/constants/firebase";

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated, redirect to tenant dashboard by default
        // The dashboard will handle proper routing based on user type
        console.log("User authenticated, redirecting to dashboard...");
        router.replace("/tenant/dashboard");
      } else {
        // User is not authenticated, redirect to login
        console.log("User not authenticated, redirecting to login...");
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, []);

  // Return null while checking auth state
  return null;
}
