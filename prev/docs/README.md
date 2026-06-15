# Documentation

This directory contains the consolidated documentation for Panamerican Taekwondo Academy.

## Structure

```
docs/
├── index.html          # Main documentation hub with navigation
├── pages/              # Page-level documentation (10 HTML files)
│   ├── Feed.html
│   ├── Events.html
│   ├── Members.html
│   ├── Forum.html
│   ├── Messages.html
│   ├── Profile.html
│   ├── InstructorTools.html
│   ├── Admin.html
│   ├── Setup.html
│   └── AcceptInvite.html
├── components/         # Component documentation (16 HTML files)
│   ├── admin/
│   ├── events/
│   ├── feed/
│   ├── instructor/
│   ├── members/
│   ├── messages/
│   ├── notifications/
│   ├── request/
│   └── ui/
├── entities/          # Data entity schemas (16 JSON files)
│   ├── Achievement.json
│   ├── Attendance.json
│   ├── Broadcast.json
│   ├── Class.json
│   ├── Comment.json
│   ├── Event.json
│   ├── FamilyRelationship.json
│   ├── Feedback.json
│   ├── ForumReply.json
│   ├── ForumThread.json
│   ├── Message.json
│   ├── Notification.json
│   ├── Post.json
│   ├── RecurringSchedule.json
│   ├── Request.json
│   └── TrainingModule.json
└── Layout.js          # React layout component reference
```

## Access Points

All HTML files serve as direct access points to their respective documentation. Open `index.html` in a browser for the main navigation hub.

## Usage

1. Open `docs/index.html` in your browser for centralized navigation
2. Navigate to specific pages, components, or entities using the categorized links
3. All original HTML files are preserved as access points
4. Entity JSON files provide schema references for the data models
