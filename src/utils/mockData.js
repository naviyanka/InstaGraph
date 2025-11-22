import { MOCK_NAMES } from '../config/constants';

export const generatePosts = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `post_${Math.random().toString(36).substr(2, 9)}`,
    imageUrl: `https://picsum.photos/seed/${Math.random()}/300/300`,
    likes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 50),
    caption: ["Just another day in paradise! 🌴", "Work grind 💻 #coding", "Coffee first ☕️", "Throwback to last summer ☀️", "New project coming soon..."][Math.floor(Math.random() * 5)]
  }));
};

export const generateUser = (id, username, isPrivate = false) => {
  const createdDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
  const postsCount = Math.floor(Math.random() * 20) + 1;
  return {
    id,
    username: username || `user_${id}`,
    fullName: (username || `User ${id}`).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    bio: isPrivate ? "This account is private." : "Digital explorer | Tech enthusiast | 📍 NYC | DM for collab 📩",
    followersCount: Math.floor(Math.random() * 5000) + 100,
    followingCount: Math.floor(Math.random() * 1000) + 50,
    postsCount: postsCount,
    posts: generatePosts(postsCount),
    isPrivate,
    riskScore: Math.floor(Math.random() * 100),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || id}`,
    color: isPrivate ? '#64748b' : '#3b82f6',
    location: ["New York, USA", "London, UK", "Berlin, DE", "Tokyo, JP", "Unknown"][Math.floor(Math.random() * 5)],
    joinedDate: createdDate.toLocaleDateString(),
    email: Math.random() > 0.7 ? `${username}@gmail.com` : null,
    phone: Math.random() > 0.8 ? "+1 *** *** ****" : null,
    followers: [],
    following: []
  };
};
