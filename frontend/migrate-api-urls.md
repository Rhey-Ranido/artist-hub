# API URL Migration Guide

Your frontend has been partially updated to use environment variables. Here's what you need to do:

## ✅ Completed
- Created `src/config/api.js` with centralized API configuration
- Updated `src/utils/apiClient.js` to use the new configuration
- Updated `src/components/MessageCenter.jsx` (partially)

## 🔄 Files That Need Manual Updates

Replace hardcoded URLs in these files with imports from the config:

### 1. Add Import Statement
Add this import to the top of each file:
```javascript
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
// OR for nested files:
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
```

### 2. Replace Hardcoded URLs

**Replace this pattern:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
// OR
const API_BASE_URL = 'http://localhost:3000/api';
```

**With:**
```javascript
// Remove the const declaration, use imported API_BASE_URL
```

### 3. Files to Update (39 total)

**High Priority (Core functionality):**
1. `src/pages/Profile.jsx`
2. `src/components/ProfileImageUpload.jsx`
3. `src/pages/UserSettings.jsx`
4. `src/pages/Messages.jsx`
5. `src/pages/Home.jsx`
6. `src/pages/Artworks.jsx`

**Medium Priority:**
7. `src/pages/Search.jsx`
8. `src/pages/Create.jsx`
9. `src/pages/Tutorials.jsx`
10. `src/pages/TutorialDetail.jsx`
11. `src/pages/Services.jsx`
12. `src/pages/ServiceDetails.jsx`

**Admin Pages:**
13. `src/pages/AdminDashboard.jsx`
14. `src/pages/AdminArtworkDetail.jsx`
15. `src/pages/AdminUserDetail.jsx`
16. `src/pages/AdminTutorialDetail.jsx`
17. `src/pages/AdminProviderDetail.jsx`

**Provider/Service Components:**
18. `src/pages/ProviderProfile.jsx`
19. `src/pages/ProviderDashboard.jsx`
20. `src/components/ServiceImageManager.jsx`
21. `src/components/ServiceReviews.jsx`
22. `src/components/ServiceSearch.jsx`
23. `src/components/ProviderReviews.jsx`
24. `src/components/ServiceEditModal.jsx`
25. `src/components/ServiceCreationForm.jsx`
26. `src/components/ProviderRegistrationForm.jsx`
27. `src/components/NewConversationModal.jsx`

**Other Components:**
28. `src/components/Navbar.jsx`
29. `src/components/ArtworkCard.jsx`
30. `src/components/UserProfile.jsx`
31. `src/components/TutorialCard.jsx`
32. `src/components/ServiceManagement.jsx`
33. `src/pages/ArtworkDetails.jsx`
34. `src/pages/MyArtworks.jsx`
35. `src/pages/EditArtwork.jsx`
36. `src/pages/Notifications.jsx`
37. `src/hooks/usePersistedLike.js`

## 🚀 Quick Migration Steps

### For each file:

1. **Add import at the top:**
```javascript
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
```

2. **Remove the hardcoded declaration:**
```javascript
// DELETE this line:
const API_BASE_URL = 'http://localhost:5000/api';
```

3. **Update Socket.IO connections:**
```javascript
// Replace:
const socket = io('http://localhost:3000');
// With:
import { SOCKET_URL } from '../config/api';
const socket = io(SOCKET_URL);
```

## 🎯 Example Migration

**Before:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';

const fetchUser = async () => {
  const response = await fetch(`${API_BASE_URL}/users/profile`);
  return response.json();
};
```

**After:**
```javascript
import { API_ENDPOINTS } from '../config/api';

const fetchUser = async () => {
  const response = await fetch(API_ENDPOINTS.USERS.PROFILE);
  return response.json();
};
```

## 🔧 Environment Files to Create

Create these files in your `frontend/` directory:

**`.env.development`:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:3000
```

**`.env.production`:**
```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=
```

## ✅ Testing

After migration:
1. Test in development: `npm run dev`
2. Test production build: `npm run build && npm run preview`
3. Deploy to Vercel

The new system will automatically use the correct URLs for each environment!
