import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc,
  getDoc,
  updateDoc,
  increment,
  deleteDoc
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType, resendVerification } from "../../lib/firebase";
import { MessageSquare, Heart, User, LogIn, Send, Loader2, Filter, ChevronRight, AlertCircle, Share2, Edit3, Trash2, Reply } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: any;
  likesCount: number;
}

export const ForumSection = ({ onOpenProfile }: { onOpenProfile?: () => void }) => {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tags: doc.data().tags || []
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "posts");
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(p => {
    const matchesCategory = filter === "all" || p.category === filter;
    const matchesTag = !tagFilter || (p.tags && p.tags.includes(tagFilter));
    return matchesCategory && matchesTag;
  });

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).sort();

  return (
    <section id="forum" className="py-32 px-10 max-w-7xl mx-auto border-t border-brand-text/10">
      {user && !user.emailVerified && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-6 bg-brand-accent/10 border border-brand-accent/20 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-brand-accent" />
            <p className="text-sm font-serif italic text-brand-text">
              Your identity requires verification. Please verify your email to contribute to the archive.
            </p>
          </div>
          <button 
            onClick={async () => {
              try {
                await resendVerification();
                alert("Verification link sent to your email.");
              } catch (e) {
                console.error(e);
              }
            }}
            className="text-[10px] uppercase tracking-widest font-bold text-brand-accent border-b border-brand-accent hover:opacity-70 transition-all"
          >
            Resend Verification Link
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-brand-text/10 pb-12">
        <div className="space-y-6">
          <span className="text-[10px] uppercase tracking-editorial font-bold text-brand-accent">03. Global Dialogue</span>
          <h2 className="text-6xl font-serif tracking-tight text-brand-text leading-tight">The Community <br/><span className="italic">Archive</span></h2>
          <p className="text-brand-text/60 text-lg leading-relaxed font-light max-w-xl">
            A decentralized forum for sharing transition experiences, safety protocols, and regional clean energy success stories.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <button 
              onClick={signInWithGoogle}
              className="bg-brand-text text-white px-10 py-4 text-[10px] uppercase tracking-editorial font-bold flex items-center gap-3 hover:bg-brand-accent transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In to Contribute
            </button>
          ) : (
            <button 
              onClick={() => setShowPostForm(!showPostForm)}
              className="bg-brand-accent text-white px-10 py-4 text-[10px] uppercase tracking-editorial font-bold flex items-center gap-3 hover:bg-brand-text transition-all"
            >
              {showPostForm ? "Close Form" : "Start a Topic"}
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        <aside className="lg:col-span-3 space-y-12">
          <div className="space-y-6">
            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/40">Categories</span>
            <div className="flex flex-col gap-4">
              {["all", "safety", "efficiency", "general", "success"].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilter(cat);
                    setTagFilter(null);
                  }}
                  className={`text-left text-sm uppercase tracking-widest transition-all ${
                    filter === cat ? "text-brand-accent font-bold pl-4 border-l-2 border-brand-accent" : "text-brand-text/40 hover:text-brand-text pl-0"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/40">Active Tags</span>
            <div className="flex flex-wrap gap-2">
              {allTags.length > 0 ? (
                allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
                    className={`px-3 py-1 text-[8px] uppercase tracking-widest font-bold border transition-all ${
                      tag === tagFilter 
                        ? "bg-brand-accent text-white border-brand-accent" 
                        : "text-brand-text/40 border-brand-text/10 hover:border-brand-accent hover:text-brand-accent"
                    }`}
                  >
                    #{tag}
                  </button>
                ))
              ) : (
                <span className="text-[8px] opacity-20 italic">No tags associated.</span>
              )}
            </div>
          </div>

          {user && (
            <div 
              onClick={onOpenProfile}
              className="p-8 bg-brand-muted space-y-4 cursor-pointer hover:bg-brand-paper transition-all"
            >
              <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/40">Registered User</span>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-text rounded-full flex items-center justify-center text-white font-serif italic">
                  {user.displayName?.[0] || "U"}
                </div>
                <div>
                  <p className="text-sm font-bold truncate max-w-[150px]">{user.displayName}</p>
                  <p className="text-[10px] opacity-40">Contributor</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        <div className="lg:col-span-9">
          <AnimatePresence>
            {showPostForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-20"
              >
                <PostForm onSuccess={() => setShowPostForm(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="space-y-16">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse grid md:grid-cols-12 gap-8 items-start opacity-50">
                  <div className="md:col-span-2 pt-2 space-y-4">
                    <div className="h-2 w-16 bg-brand-text/10 rounded" />
                    <div className="h-2 w-24 bg-brand-text/10 rounded" />
                    <div className="flex gap-1 mt-4">
                      <div className="h-4 w-12 bg-brand-text/10 rounded" />
                      <div className="h-4 w-12 bg-brand-text/10 rounded" />
                    </div>
                  </div>
                  <div className="md:col-span-10 space-y-6">
                    <div className="h-10 w-3/4 bg-brand-text/10 rounded" />
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-brand-text/10 rounded" />
                      <div className="h-3 w-full bg-brand-text/10 rounded" />
                      <div className="h-3 w-2/3 bg-brand-text/10 rounded" />
                    </div>
                    <div className="flex justify-between pt-6 border-t border-brand-text/5">
                      <div className="h-2 w-32 bg-brand-text/10 rounded" />
                      <div className="flex gap-8">
                        <div className="h-4 w-4 bg-brand-text/10 rounded" />
                        <div className="h-4 w-4 bg-brand-text/10 rounded" />
                        <div className="h-4 w-4 bg-brand-text/10 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {filteredPosts.length === 0 ? (
                <p className="text-brand-text/30 italic font-serif text-xl">No entries found under this category yet.</p>
              ) : (
                filteredPosts.map(post => <PostCard key={post.id} post={post} onSelectTag={setTagFilter} />)
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const PostForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const DRAFT_KEY = "forum_post_draft";

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const { title, content, category, tags } = JSON.parse(draft);
        if (title) setTitle(title);
        if (content) setContent(content);
        if (category) setCategory(category);
        if (tags) setTags(tags);
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    const draft = { title, content, category, tags };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    // Optional: add a temporary "Saved" indicator or alert
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !content || !user.emailVerified) return;

    setSubmitting(true);
    try {
      const tagList = tags.split(",")
        .map(t => t.trim().toLowerCase())
        .filter(t => t !== "")
        .slice(0, 10); // Limit to 10 tags
      const postData = {
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        title,
        content,
        category,
        tags: tagList,
        createdAt: serverTimestamp(),
        likesCount: 0
      };
      await addDoc(collection(db, "posts"), postData);
      
      // Clear draft on success
      localStorage.removeItem(DRAFT_KEY);
      
      // Also ensure user doc exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName || "Anonymous",
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp()
        });
      }

      onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "posts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-brand-paper p-10 border border-brand-text/10 space-y-8">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-2xl font-serif italic text-brand-accent">New Contribution</h3>
        <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/40">Markdown Supported</span>
      </div>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Classification</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent border-b border-brand-text/20 py-2 focus:outline-none focus:border-brand-accent transition-colors font-serif italic"
            >
              <option value="general">General Narrative</option>
              <option value="safety">Safety Protocol</option>
              <option value="efficiency">Efficiency Analysis</option>
              <option value="success">Success Story</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Entry Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summary of your topic..."
              className="w-full bg-transparent border-b border-brand-text/20 py-2 focus:outline-none focus:border-brand-accent transition-colors font-serif"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Keywords / Tags</label>
            <input 
              type="text" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="biogas, solar, efficiency (comma separated)..."
              className="w-full bg-transparent border-b border-brand-text/20 py-2 focus:outline-none focus:border-brand-accent transition-colors font-serif"
            />
          </div>
          <div className="flex items-end pb-2">
            <p className="text-[8px] opacity-30 italic">Tags enable precise indexing within the community archive.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Detailed Content</label>
          <textarea 
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Document your findings or inquiry here..."
            className="w-full bg-transparent border-b border-brand-text/20 py-2 focus:outline-none focus:border-brand-accent transition-colors font-serif resize-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting || !user?.emailVerified}
          className={`bg-brand-text text-white px-12 py-5 text-[10px] uppercase tracking-editorial font-bold flex items-center gap-3 transition-all ${
            !user?.emailVerified ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-accent"
          }`}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            !user?.emailVerified ? "Verification Required" : <>Submitting Document <Send className="w-4 h-4" /></>
          )}
        </button>

        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-10 py-5 text-[10px] uppercase tracking-editorial font-bold border border-brand-text/10 hover:bg-brand-muted transition-all text-brand-text/60"
        >
          Save for Later
        </button>
      </div>
    </form>
  );
};

const PostCard = ({ post, onSelectTag }: { post: Post, onSelectTag?: (tag: string) => void }) => {
  const [user] = useAuthState(auth);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editCategory, setEditCategory] = useState(post.category);
  const [editTags, setEditTags] = useState(post.tags?.join(", ") || "");
  const [updating, setUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    if (!user || !user.emailVerified || user.uid !== post.authorId) return;
    
    if (window.confirm("Are you sure you want to delete this entry from the archive? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "posts", post.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `posts/${post.id}`);
      }
    }
  };

  const handleUpdate = async () => {
    if (!user || !user.emailVerified || updating) return;
    setUpdating(true);
    try {
      const tagList = editTags.split(",")
        .map(t => t.trim().toLowerCase())
        .filter(t => t !== "")
        .slice(0, 10); // Limit to 10 tags
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        title: editTitle,
        content: editContent,
        category: editCategory,
        tags: tagList
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !user.emailVerified || liking) return;

    setLiking(true);
    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}`);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: post.title,
      text: `Clean Cooking Archive: ${post.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Archive entry link copied to clipboard.");
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
  };

  return (
    <motion.article 
      layout
      className="group"
    >
      <div className="grid md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-2 pt-2">
          <div className="flex flex-col gap-1">
            {isEditing ? (
              <select 
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="text-[10px] uppercase tracking-widest font-bold text-brand-accent italic bg-transparent border-b border-brand-accent/20 focus:outline-none mb-2"
              >
                <option value="general">General Narrative</option>
                <option value="safety">Safety Protocol</option>
                <option value="efficiency">Efficiency Analysis</option>
                <option value="success">Success Story</option>
              </select>
            ) : (
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent italic mb-2">— {post.category}</span>
            )}
            <span className="text-[9px] uppercase font-bold opacity-30">{new Date(post.createdAt?.toDate()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {post.tags.map(tag => (
                <span 
                  key={tag} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTag?.(tag);
                  }}
                  className="text-[8px] border border-brand-text/10 px-1.5 py-0.5 opacity-40 hover:opacity-100 hover:border-brand-accent hover:text-brand-accent transition-all cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-10 space-y-6">
          {isEditing ? (
            <div className="space-y-4 w-full">
              <input 
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-3xl font-serif leading-tight text-brand-text bg-transparent border-b border-brand-accent/20 focus:outline-none w-full"
                placeholder="Entry Title"
              />
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent border-b border-brand-text/20 py-2 focus:outline-none focus:border-brand-accent transition-colors font-serif italic text-sm h-32 resize-none"
                placeholder="Document your findings..."
              />
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest font-bold opacity-30">Tags (comma separated)</label>
                <input 
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full bg-transparent border-b border-brand-accent/20 focus:outline-none font-serif italic text-sm py-1"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleUpdate}
                  disabled={updating}
                  className="bg-brand-text text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-all flex items-center gap-2"
                >
                  {updating ? <Loader2 className="w-3 h-3 animate-spin"/> : "Save Archive"}
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-brand-text/40 hover:text-brand-text px-6 py-2 text-[10px] uppercase tracking-widest font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-3xl font-serif leading-tight group-hover:italic transition-all cursor-pointer" onClick={() => setShowComments(!showComments)}>
                {post.title}
              </h3>
              <div className="space-y-4">
                <div className={`markdown-body font-light ${isExpanded ? "" : "line-clamp-3"}`}>
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
                {post.content.length > 200 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:opacity-70 transition-all flex items-center gap-1"
                  >
                    {isExpanded ? "Collapse Entry" : "Read Full Fragment"}
                  </button>
                )}
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between pt-6 border-t border-brand-text/5 mt-4">
            <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold">
              <span className="text-brand-text/40">By</span>
              <span className="text-brand-text">{post.authorName}</span>
              {user?.uid === post.authorId && !isEditing && (
                <div className="flex items-center gap-4 ml-4">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-brand-accent hover:opacity-70 transition-all flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Entry
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="text-red-500/60 hover:text-red-500 transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-8">
              {!isEditing && (
                <>
                  <button 
                    onClick={handleLike}
                    disabled={liking || !user?.emailVerified}
                    className={`flex items-center gap-2 transition-colors ${
                      liking || !user?.emailVerified ? "opacity-30 cursor-not-allowed" : "text-brand-text/30 hover:text-brand-accent scale-100 hover:scale-110 active:scale-95"
                    }`}
                    title={!user?.emailVerified ? "Verification required to like" : "Like post"}
                  >
                    <Heart className={`w-4 h-4 ${liking ? "animate-ping text-brand-accent" : ""}`} />
                    <span className="text-[10px] font-bold">{post.likesCount || 0}</span>
                  </button>
                  <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-brand-text/30 hover:text-brand-accent transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[10px] font-bold">View Dialogue</span>
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 text-brand-text/30 hover:text-brand-accent transition-colors"
                    title="Share entry"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Share</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-8"
              >
                <CommentSection postId={post.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
};

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: any;
  parentId?: string;
  postId: string;
}

const CommentSection = ({ postId }: { postId: string }) => {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  useEffect(() => {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `posts/${postId}/comments`);
    });
    return () => unsubscribe();
  }, [postId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim() || !user.emailVerified) return;

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        postId,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        text,
        createdAt: serverTimestamp(),
        ...(replyingTo && { parentId: replyingTo.id })
      });
      setText("");
      setReplyingTo(null);
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments`);
    }
  };

  const organizeComments = (comments: Comment[]) => {
    const map: { [key: string]: Comment & { children: any[] } } = {};
    const roots: any[] = [];

    comments.forEach(c => {
      map[c.id] = { ...c, children: [] };
    });

    comments.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  };

  const threadedComments = organizeComments(comments);

  return (
    <div className="bg-brand-paper p-10 space-y-10 border-l border-brand-text/10">
       <div className="space-y-8">
        {threadedComments.map(c => (
          <CommentCard key={c.id} comment={c} onReply={setReplyingTo} />
        ))}
        {comments.length === 0 && !loading && (
          <p className="text-xs text-brand-text/30 italic">No dialogue yet. Be the first to analyze.</p>
        )}
      </div>

      {user ? (
        <form onSubmit={handlePostComment} className="flex flex-col gap-4 pt-10 border-t border-brand-text/10">
          {replyingTo && (
            <div className="flex items-center justify-between bg-brand-muted p-4 border-l-2 border-brand-accent">
              <p className="text-[10px] italic">Replying to <span className="font-bold">{replyingTo.authorName}</span></p>
              <button 
                type="button" 
                onClick={() => setReplyingTo(null)}
                className="text-[10px] uppercase font-bold opacity-30 hover:opacity-100"
              >
                Cancel
              </button>
            </div>
          )}
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!user.emailVerified}
            placeholder={user.emailVerified ? (replyingTo ? "Add your perspective..." : "Add a scholarly observation...") : "Identity verification required to append dialogue."}
            className="w-full bg-transparent border-b border-brand-text/20 py-2 focus:outline-none focus:border-brand-accent transition-colors text-sm font-serif italic h-20 resize-none disabled:opacity-30"
          />
          <button 
            disabled={!user.emailVerified}
            className={`self-end text-[9px] uppercase tracking-editorial font-bold text-brand-text flex items-center gap-2 transition-colors ${
              !user.emailVerified ? "opacity-30 cursor-not-allowed" : "hover:text-brand-accent"
            }`}
          >
            {user.emailVerified ? <>{replyingTo ? "Post Reply" : "Append to Dialogue"} <ChevronRight className="w-3 h-3" /></> : "Verification Required"}
          </button>
        </form>
      ) : (
        <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 text-center">Authentication required to append dialogue.</p>
      )}
    </div>
  );
};

const CommentCard = ({ comment, onReply, depth = 0 }: { comment: any, onReply: (c: Comment) => void, depth?: number }) => {
  const [user] = useAuthState(auth);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group/comment relative ${
      depth > 0 
        ? "ml-6 md:ml-12 border-l-2 border-brand-accent/20 pl-6 md:pl-10 pb-6 mt-6 pt-2" 
        : "border-b border-brand-text/10 pb-12 mb-12 last:border-0 last:mb-0 last:pb-0"
    }`}>
      {depth > 0 && (
        <div className="absolute top-0 left-0 w-4 h-px bg-brand-accent/20 -ml-[2px] mt-8" />
      )}
      
      <div className="flex justify-between items-baseline mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-text/5 flex items-center justify-center text-[10px] font-serif italic text-brand-text/60 border border-brand-text/10 group-hover/comment:border-brand-accent/30 transition-colors">
            {comment.authorName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">{comment.authorName}</span>
              {depth > 0 && (
                <span className="text-[8px] bg-brand-accent/5 text-brand-accent px-1.5 py-0.5 uppercase tracking-widest font-bold border border-brand-accent/10">Thread</span>
              )}
            </div>
            <span className="text-[9px] opacity-30 font-serif italic block mt-0.5">
              {comment.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <div className="markdown-body text-sm font-light leading-relaxed text-brand-text/80 pl-11">
        <ReactMarkdown>{comment.text}</ReactMarkdown>
      </div>
      
      <div className="flex items-center gap-6 pl-11 mt-4">
        {user?.emailVerified && depth < 3 && (
          <button 
            onClick={() => onReply(comment)}
            className="text-[9px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 hover:text-brand-accent transition-all flex items-center gap-2 group/reply"
          >
            <Reply className="w-3 h-3 transition-transform group-hover/reply:-translate-y-0.5" /> 
            Respond to Citation
          </button>
        )}
      </div>

      {comment.children && comment.children.length > 0 && (
        <div className="mt-4">
          {comment.children.map((child: any) => (
            <CommentCard key={child.id} comment={child} onReply={onReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );
};
