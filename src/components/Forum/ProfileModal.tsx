import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { doc, getDoc, updateDoc, collection, query, where, getCountFromServer, collectionGroup, orderBy, limit, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage, handleFirestoreError, OperationType } from "../../lib/firebase";
import { X, User, Edit3, Save, Loader2, CheckCircle, ShieldAlert, Camera } from "lucide-react";

export const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [user] = useAuthState(auth);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setDisplayName(data.displayName || user.displayName || "");
          setPhotoURL(data.photoURL || user.photoURL || "");
          setBio(data.bio || "");
        } else {
          setDisplayName(user.displayName || "");
          setPhotoURL(user.photoURL || "");
        }

        // Fetch counts
        const postsQuery = query(collection(db, "posts"), where("authorId", "==", user.uid));
        const postsSnapshot = await getCountFromServer(postsQuery);
        setPostCount(postsSnapshot.data().count);

        const commentsQuery = query(collectionGroup(db, "comments"), where("authorId", "==", user.uid));
        const commentsSnapshot = await getCountFromServer(commentsQuery);
        setCommentCount(commentsSnapshot.data().count);

        // Fetch recent activities
        const postsQueryRecent = query(
          collection(db, "posts"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const postsSnapshotRecent = await getDocs(postsQueryRecent);
        const recentPosts = postsSnapshotRecent.docs.map(doc => ({
          id: doc.id,
          type: 'post',
          title: doc.data().title,
          createdAt: doc.data().createdAt,
        }));

        const commentsQueryRecent = query(
          collectionGroup(db, "comments"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const commentsSnapshotRecent = await getDocs(commentsQueryRecent);
        const recentComments = commentsSnapshotRecent.docs.map(doc => ({
          id: doc.id,
          type: 'comment',
          text: doc.data().text,
          createdAt: doc.data().createdAt,
        }));

        const combined = [...recentPosts, ...recentComments]
          .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
          .slice(0, 5);
        
        setRecentActivity(combined);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isOpen]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setPhotoURL(url);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        photoURL,
        bio,
      });
      setEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-brand-bg w-full max-w-lg border border-brand-text/10 shadow-2xl p-12 space-y-10"
        >
          <button onClick={onClose} className="absolute top-8 right-8 text-brand-text/30 hover:text-brand-text">
            <X className="w-6 h-6" />
          </button>

          <header className="space-y-4 border-b border-brand-text/10 pb-8">
            <span className="text-[10px] uppercase tracking-editorial font-bold text-brand-accent italic">Member Profile</span>
            <div className="flex items-center gap-6">
              {loading ? (
                <div className="animate-pulse w-20 h-20 bg-brand-text/5 rounded shrink-0" />
              ) : (
                <div className="relative group w-20 h-20 bg-brand-text overflow-hidden flex items-center justify-center text-3xl font-serif italic text-white shrink-0">
                  {photoURL ? (
                    <img src={photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    displayName?.[0] || user?.displayName?.[0] || "U"
                  )}
                  {editing && (
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-white" />
                          <span className="text-[8px] uppercase font-bold text-white mt-1">Upload</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              )}
              <div className="space-y-1 flex-1">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 w-3/4 bg-brand-text/5 rounded" />
                    <div className="h-2 w-1/2 bg-brand-text/5 rounded" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {editing ? (
                        <input 
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="text-2xl font-serif text-brand-text bg-transparent border-b border-brand-accent/30 focus:outline-none focus:border-brand-accent w-full"
                          placeholder="Display Name"
                        />
                      ) : (
                        <h3 className="text-3xl font-serif text-brand-text">{displayName || user?.displayName}</h3>
                      )}
                      {user?.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-brand-accent shrink-0" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-brand-accent/40 shrink-0" />
                      )}
                    </div>
                    {editing && (
                       <input 
                        type="text"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="text-[10px] uppercase tracking-widest font-bold opacity-30 bg-transparent border-b border-brand-accent/30 focus:outline-none focus:border-brand-accent w-full py-1"
                        placeholder="Profile Image URL"
                      />
                    )}
                    {!editing && (
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">
                        {user?.emailVerified ? "Verified Contributor" : "Unverified Contributor"} — since 2026
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </header>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">Personal Narrative / Bio</label>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-[10px] uppercase font-bold opacity-40 hover:opacity-100 italic">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 text-[10px] uppercase font-bold text-brand-accent hover:opacity-80 italic">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3" /> Save Changes</>}
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-full bg-brand-text/5 rounded" />
                  <div className="h-4 w-3/4 bg-brand-text/5 rounded" />
                </div>
              ) : editing ? (
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-brand-paper border border-brand-text/10 p-4 font-serif italic text-sm focus:outline-none focus:border-brand-accent h-32 resize-none"
                  placeholder="Tell the community about your clean cooking journey..."
                />
              ) : (
                <p className="font-serif italic text-brand-text/60 leading-relaxed">
                  {bio || "This contributor has not yet archived their personal narrative."}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-brand-text/10 pt-10">
              <div className="space-y-2">
                {loading ? (
                  <div className="animate-pulse h-10 w-12 bg-brand-text/5 rounded" />
                ) : (
                  <span className="text-4xl font-serif italic text-brand-text">{postCount}</span>
                )}
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-30">Archived Posts</p>
              </div>
              <div className="space-y-2">
                {loading ? (
                  <div className="animate-pulse h-10 w-12 bg-brand-text/5 rounded" />
                ) : (
                  <span className="text-4xl font-serif italic text-brand-text">{commentCount}</span>
                )}
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-30">Dialogues Appended</p>
              </div>
            </div>

            <div className="border-t border-brand-text/10 pt-10 space-y-6">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">Recent Activity</label>
              <div className="space-y-4">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex flex-col gap-2 border-l border-brand-text/10 pl-4">
                      <div className="flex justify-between">
                        <div className="h-2 w-16 bg-brand-text/5 rounded" />
                        <div className="h-2 w-12 bg-brand-text/5 rounded" />
                      </div>
                      <div className="h-3 w-full bg-brand-text/5 rounded" />
                    </div>
                  ))
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex flex-col gap-1 border-l border-brand-text/10 pl-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] uppercase font-bold opacity-30 italic">
                          {activity.type === 'post' ? 'New Archive' : 'Dialogue Addition'}
                        </span>
                        <span className="text-[8px] opacity-20">
                          {activity.createdAt?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs font-serif line-clamp-1 italic text-brand-text/80">
                        {activity.type === 'post' ? activity.title : activity.text}
                      </p>
                    </div>
                  ))
                )}
                {recentActivity.length === 0 && !loading && (
                  <p className="text-[10px] italic opacity-30 text-center py-4">No recent activity detected.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
