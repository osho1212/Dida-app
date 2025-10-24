import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  signInWithCredential
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { auth, db } from "../firebase/client.js";

const FirebaseContext = createContext({
  user: null,
  profile: null,
  loading: true,
  error: null,
  actions: {}
});

function FirebaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If Firebase is not initialized, just set loading to false
    if (!auth) {
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setError(null);
      setLoading(false);

      if (!firebaseUser) {
        setProfile(null);
        // Only sign in anonymously if there's no user at all
        signInAnonymously(auth).catch(() => {
          // Ignore anonymous sign-in errors; user can still authenticate manually.
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setProfileLoading(false);
      return () => {};
    }

    const profileRef = doc(db, "users", user.uid);
    setProfileLoading(true);

    // Ensure the profile document exists with baseline metadata.
    setDoc(
      profileRef,
      {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        provider: user.providerData?.[0]?.providerId ?? (user.isAnonymous ? "anonymous" : "password")
      },
      { merge: true }
    ).catch(() => {
      // Ignore background profile creation errors for now.
    });

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null);
        setProfileLoading(false);
      },
      () => {
        setProfile(null);
        setProfileLoading(false);
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

  const linkOrSignInWithEmail = async (email, password, displayName, isRegister) => {
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(email, password);
      let credentialedUser;

      if (auth.currentUser && auth.currentUser.isAnonymous) {
        credentialedUser = await linkWithCredential(auth.currentUser, credential);
      } else if (isRegister) {
        credentialedUser = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        credentialedUser = await signInWithEmailAndPassword(auth, email, password);
      }

      if (displayName && credentialedUser?.user) {
        await updateProfile(credentialedUser.user, { displayName });
      }

      return credentialedUser?.user ?? auth.currentUser;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    return linkOrSignInWithEmail(email, password, displayName, true);
  };

  const signInWithEmail = async (email, password) => {
    return linkOrSignInWithEmail(email, password, null, false);
  };

  const signInWithGoogleProvider = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        const linked = await linkWithPopup(auth.currentUser, provider);
        return linked.user;
      }
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err) {
      if (
        err.code === "auth/credential-already-in-use" ||
        err.code === "auth/account-exists-with-different-credential"
      ) {
        const credential =
          GoogleAuthProvider.credentialFromError?.(err) ??
          err.credential ??
          null;

        if (auth.currentUser?.isAnonymous) {
          try {
            await signOut(auth);
          } catch {
            // ignore sign-out issues
          }
        }

        if (credential) {
          const signedIn = await signInWithCredential(auth, credential);
          return signedIn.user;
        }

        const result = await signInWithPopup(auth, provider);
        return result.user;
      }

      setError(err);
      throw err;
    }
  };

  const signOutUser = async () => {
    setError(null);
    await signOut(auth);
    // Don't automatically sign in anonymously after sign out
    // The onAuthStateChanged listener will handle it if needed
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading: loading || profileLoading,
      error,
      actions: {
        registerWithEmail,
        signInWithEmail,
        signInWithGoogle: signInWithGoogleProvider,
        signOut: signOutUser
      }
    }),
    [user, profile, loading, profileLoading, error]
  );

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

export default FirebaseProvider;
