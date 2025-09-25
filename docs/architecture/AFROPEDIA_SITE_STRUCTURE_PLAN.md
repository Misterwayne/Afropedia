# Afropedia - Site Structure & User Journey Plan

## 🎯 **Vision Statement**
Afropedia is a state-of-the-art African encyclopedia with academic peer review, featuring warm African aesthetics and an intuitive user journey that celebrates African knowledge and culture.

## 🗺️ **Site Structure Overview**

### **1. PUBLIC PAGES (No Authentication Required)**
```
/ (Homepage)
├── /about (About Afropedia)
├── /browse (Browse Articles by Category)
├── /search (Search Articles)
├── /wiki/[title] (View Article)
├── /auth/login (Login)
├── /auth/register (Register)
└── /contact (Contact Us)
```

### **2. AUTHENTICATED PAGES (User Required)**
```
/dashboard (User Dashboard)
├── /profile (User Profile)
├── /my-articles (User's Articles)
├── /my-reviews (User's Reviews)
├── /notifications (Notifications)
└── /settings (Account Settings)
```

### **3. CONTENT CREATION PAGES (Editor+ Required)**
```
/edit/new (Create New Article)
├── /edit/[title] (Edit Article)
├── /history/[title] (Article History)
└── /media/upload (Upload Media)
```

### **4. PEER REVIEW SYSTEM (Reviewer+ Required)**
```
/peer-review (Review Dashboard)
├── /peer-review/[reviewId] (Individual Review)
├── /peer-review/analytics (Review Analytics)
├── /peer-review/templates (Review Templates)
└── /peer-review/assignments (Review Assignments)
```

### **5. MODERATION SYSTEM (Moderator+ Required)**
```
/moderation (Moderation Dashboard)
├── /moderation/queue (Content Queue)
├── /moderation/review/[revisionId] (Review Content)
├── /moderation/actions (Moderation Actions)
└── /moderation/analytics (Moderation Analytics)
```

### **6. LIBRARY SYSTEM (All Users)**
```
/library (Book Library)
├── /library/[id] (View Book)
├── /library/add (Add Book)
├── /library/edit/[id] (Edit Book)
└── /library/categories (Book Categories)
```

## 🚀 **User Journey Flows**

### **Flow 1: New Visitor Journey**
```
Landing Page → Browse/Search → Read Article → Register → Dashboard
```

**Steps:**
1. **Landing Page**: Stunning hero section showcasing African knowledge
2. **Browse/Search**: Discover articles by category or search
3. **Read Article**: Immersive reading experience with peer review badges
4. **Call-to-Action**: "Join the Community" → Register
5. **Welcome Dashboard**: Onboarding and first steps

### **Flow 2: Content Creator Journey**
```
Dashboard → Create Article → Peer Review → Publish → Monitor
```

**Steps:**
1. **Dashboard**: Quick access to "Create New Article"
2. **Article Editor**: Rich markdown editor with media support
3. **Submit for Review**: Automatic peer review assignment
4. **Review Process**: Track review progress and feedback
5. **Publish**: Article goes live with peer review badge
6. **Monitor**: Track views, edits, and community feedback

### **Flow 3: Peer Reviewer Journey**
```
Dashboard → Review Queue → Review Article → Submit Review → Analytics
```

**Steps:**
1. **Dashboard**: "Pending Reviews" section
2. **Review Queue**: List of articles needing review
3. **Review Interface**: Advanced review tools with scoring
4. **Submit Review**: Detailed feedback and recommendations
5. **Analytics**: Track review performance and impact

### **Flow 4: Knowledge Seeker Journey**
```
Search → Article → Related Articles → Book References → Deep Dive
```

**Steps:**
1. **Search**: Intelligent search with suggestions
2. **Article**: Rich content with embedded media
3. **Related**: Discover connected knowledge
4. **References**: Access to books and sources
5. **Deep Dive**: Explore topic comprehensively

## 🎨 **Design System & Visual Hierarchy**

### **Color Palette (African-Inspired)**
- **Primary**: Warm Orange (#f28519) - African sunsets
- **Secondary**: Deep Red (#ef4444) - African earth
- **Accent**: Forest Green (#22c55e) - African nature
- **Neutral**: Earth Brown (#bfa094) - African soil
- **Background**: Cream (#fef7ed) - African sand

### **Typography Hierarchy**
- **H1**: 48px - Page titles, hero sections
- **H2**: 36px - Section headers
- **H3**: 24px - Article titles
- **H4**: 20px - Subsection headers
- **Body**: 16px - Main content
- **Small**: 14px - Captions, metadata

### **Component Hierarchy**
1. **Hero Sections**: Full-width with African patterns
2. **Cards**: Rounded corners, subtle shadows
3. **Buttons**: Warm colors, hover animations
4. **Forms**: Clean, accessible design
5. **Navigation**: Sticky header with African motifs

## 📱 **Responsive Design Strategy**

### **Mobile First Approach**
- **Mobile**: Single column, touch-friendly
- **Tablet**: Two columns, enhanced navigation
- **Desktop**: Multi-column, full features
- **Large Desktop**: Optimal spacing, advanced layouts

### **Key Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large**: 1440px+

## 🔗 **Navigation Structure**

### **Main Navigation (Header)**
```
[Afropedia Logo] | Browse | Search | Library | About | [Login/Profile]
```

### **User Dashboard Navigation**
```
[Home] | My Articles | My Reviews | Notifications | Settings | [Logout]
```

### **Breadcrumb Navigation**
```
Home > Category > Subcategory > Article Title
```

### **Footer Navigation**
```
About | Contact | Privacy | Terms | Community Guidelines | API
```

## 🎯 **Key User Experience Principles**

### **1. African Cultural Respect**
- Warm, welcoming color palette
- African-inspired patterns and motifs
- Respectful representation of diverse cultures
- Celebration of African knowledge and heritage

### **2. Academic Excellence**
- Clear peer review indicators
- Quality badges and ratings
- Source citations and references
- Expert contributor recognition

### **3. Intuitive Navigation**
- Clear information architecture
- Consistent navigation patterns
- Search-first approach
- Mobile-optimized experience

### **4. Community Engagement**
- Easy content creation
- Collaborative editing
- Peer review participation
- Knowledge sharing incentives

## 🚀 **Implementation Priority**

### **Phase 1: Core Structure**
1. Update app name and branding
2. Implement African theme
3. Redesign homepage
4. Update navigation structure

### **Phase 2: User Experience**
1. Enhance article viewing experience
2. Improve search and browse functionality
3. Redesign user dashboard
4. Optimize mobile experience

### **Phase 3: Advanced Features**
1. Enhance peer review interface
2. Improve moderation tools
3. Add advanced analytics
4. Implement notifications

### **Phase 4: Polish & Optimization**
1. Performance optimization
2. Accessibility improvements
3. SEO optimization
4. Advanced animations and interactions

## 📊 **Success Metrics**

### **User Engagement**
- Time spent on site
- Pages per session
- Return visitor rate
- Content creation rate

### **Content Quality**
- Peer review completion rate
- Article quality scores
- Community feedback ratings
- Expert contributor participation

### **Technical Performance**
- Page load speed
- Mobile usability score
- Search success rate
- System uptime

---

This plan ensures a cohesive, beautiful, and functional Afropedia that celebrates African knowledge while providing an excellent user experience for all types of users.
