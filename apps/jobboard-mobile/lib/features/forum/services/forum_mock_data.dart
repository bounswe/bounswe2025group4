import '../../../core/models/discussion_thread.dart';
import '../../../core/models/comment.dart';
import '../../../core/models/user.dart';
import '../../../core/models/user_type.dart';

/// Mock data service for forum functionality
/// This provides realistic sample data while the forum endpoints are being developed
class ForumMockData {
  // Mock users for forum discussions
  static final List<User> _mockUsers = [
    User(
      id: '1',
      username: 'sarah_johnson',
      email: 'sarah.j@example.com',
      role: UserType.ROLE_JOBSEEKER,
      firstName: 'Sarah',
      lastName: 'Johnson',
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Corp',
      bio: 'Passionate about clean code and mentoring junior developers',
    ),
    User(
      id: '2',
      username: 'alex_rodriguez',
      email: 'alex.r@example.com',
      role: UserType.ROLE_EMPLOYER,
      firstName: 'Alex',
      lastName: 'Rodriguez',
      jobTitle: 'Tech Lead',
      company: 'StartupXYZ',
      bio: 'Building innovative solutions in fintech',
    ),
    User(
      id: '3',
      username: 'emily_chen',
      email: 'emily.c@example.com',
      role: UserType.ROLE_JOBSEEKER,
      firstName: 'Emily',
      lastName: 'Chen',
      jobTitle: 'Frontend Developer',
      company: 'Web Solutions Inc',
      bio: 'UI/UX enthusiast and React specialist',
    ),
    User(
      id: '4',
      username: 'michael_brown',
      email: 'michael.b@example.com',
      role: UserType.ROLE_EMPLOYER,
      firstName: 'Michael',
      lastName: 'Brown',
      jobTitle: 'CTO',
      company: 'CloudTech',
      bio: 'Leading cloud infrastructure teams',
    ),
    User(
      id: '5',
      username: 'jessica_lee',
      email: 'jessica.l@example.com',
      role: UserType.ROLE_JOBSEEKER,
      firstName: 'Jessica',
      lastName: 'Lee',
      jobTitle: 'Data Scientist',
      company: 'Analytics Pro',
      bio: 'Machine learning and data visualization expert',
    ),
    User(
      id: '6',
      username: 'david_kim',
      email: 'david.k@example.com',
      role: UserType.ROLE_JOBSEEKER,
      firstName: 'David',
      lastName: 'Kim',
      jobTitle: 'DevOps Engineer',
      company: 'Infrastructure Inc',
      bio: 'Automating everything with CI/CD pipelines',
    ),
    User(
      id: '7',
      username: 'lisa_martinez',
      email: 'lisa.m@example.com',
      role: UserType.ROLE_EMPLOYER,
      firstName: 'Lisa',
      lastName: 'Martinez',
      jobTitle: 'Engineering Manager',
      company: 'BigTech Solutions',
      bio: 'Building and leading high-performing engineering teams',
    ),
    User(
      id: '8',
      username: 'ryan_patel',
      email: 'ryan.p@example.com',
      role: UserType.ROLE_JOBSEEKER,
      firstName: 'Ryan',
      lastName: 'Patel',
      jobTitle: 'Mobile Developer',
      company: 'AppWorks',
      bio: 'Flutter and React Native developer',
    ),
  ];

  // Mock discussion threads
  static final List<DiscussionThread> mockThreads = [
    DiscussionThread(
      id: 1,
      title: 'Best practices for technical interviews in 2025',
      body:
          'Hi everyone! I\'ve been interviewing candidates for software engineering positions and I\'m curious about what interview techniques work best in today\'s market. What are your experiences with take-home assignments vs. live coding? How do you balance technical skills assessment with cultural fit?',
      creatorId: '2',
      creatorUsername: 'alex_rodriguez',
      tags: ['Interview', 'Career', 'Best Practices'],
      reported: false,
      commentCount: 8,
      createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 3)),
    ),
    DiscussionThread(
      id: 2,
      title: 'Flutter vs React Native: Which one to choose in 2025?',
      body:
          'I\'m starting a new mobile project and trying to decide between Flutter and React Native. I have experience with JavaScript but I\'m intrigued by Dart and Flutter\'s performance. What are the current pros and cons of each framework? Any recent developments that might tip the scales?',
      creatorId: '8',
      creatorUsername: 'ryan_patel',
      tags: ['Flutter', 'React Native', 'Mobile Development', 'Technology'],
      reported: false,
      commentCount: 12,
      createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 5)),
    ),
    DiscussionThread(
      id: 3,
      title: 'Transitioning from bootcamp to first job - advice needed',
      body:
          'Just completed a 6-month intensive coding bootcamp and I\'m feeling overwhelmed by the job search. My portfolio has a few projects but I\'m worried about competing with CS graduates. How did you land your first developer job? Any tips on standing out to employers?',
      creatorId: '3',
      creatorUsername: 'emily_chen',
      tags: ['Career', 'Job Search', 'Bootcamp', 'Advice'],
      reported: false,
      commentCount: 15,
      createdAt: DateTime.now().subtract(const Duration(hours: 18)),
    ),
    DiscussionThread(
      id: 4,
      title: 'Remote work policies: What are companies offering now?',
      body:
          'With the ongoing debate about return-to-office vs remote work, I\'m curious what policies different companies are implementing. Are you seeing more hybrid models? Full remote? What\'s working well and what isn\'t?',
      creatorId: '7',
      creatorUsername: 'lisa_martinez',
      tags: ['Remote Work', 'Work Culture', 'Company Policy'],
      reported: false,
      commentCount: 6,
      createdAt: DateTime.now().subtract(const Duration(hours: 12)),
    ),
    DiscussionThread(
      id: 5,
      title: 'Machine Learning career path - specialization vs generalization',
      body:
          'I\'ve been working in data science for 2 years and I\'m at a crossroads. Should I specialize deeply in one area like NLP or computer vision, or should I maintain a broader skillset? What has worked better for career growth in your experience?',
      creatorId: '5',
      creatorUsername: 'jessica_lee',
      tags: ['Machine Learning', 'Data Science', 'Career Growth', 'Advice'],
      reported: false,
      commentCount: 9,
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
    ),
    DiscussionThread(
      id: 6,
      title: 'DevOps tools landscape 2025: What\'s essential?',
      body:
          'The DevOps ecosystem feels overwhelming with new tools emerging constantly. What tools do you consider absolutely essential in 2025? I\'m currently using Jenkins, Docker, and Kubernetes, but wondering if I should be looking at newer alternatives.',
      creatorId: '6',
      creatorUsername: 'david_kim',
      tags: ['DevOps', 'Tools', 'Technology', 'Infrastructure'],
      reported: false,
      commentCount: 11,
      createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 2)),
    ),
    DiscussionThread(
      id: 7,
      title: 'Salary negotiation strategies for software engineers',
      body:
          'I have an offer but I think it\'s below market rate. How do you approach salary negotiations? What data sources do you use to benchmark salaries? Any scripts or approaches that have worked well for you?',
      creatorId: '1',
      creatorUsername: 'sarah_johnson',
      tags: ['Salary', 'Negotiation', 'Career', 'Advice'],
      reported: false,
      commentCount: 14,
      createdAt: DateTime.now().subtract(const Duration(hours: 8)),
    ),
    DiscussionThread(
      id: 8,
      title: 'Building a cloud-native architecture from scratch',
      body:
          'Our startup is building a new product and we want to go cloud-native from day one. Looking for advice on architecture patterns, which cloud provider to choose (AWS vs Azure vs GCP), and common pitfalls to avoid. What would you do differently if you could start over?',
      creatorId: '4',
      creatorUsername: 'michael_brown',
      tags: ['Cloud', 'Architecture', 'AWS', 'Technology', 'Best Practices'],
      reported: false,
      commentCount: 7,
      createdAt: DateTime.now().subtract(const Duration(hours: 4)),
    ),
    DiscussionThread(
      id: 9,
      title: 'Work-life balance in tech: Is it a myth?',
      body:
          'Been in the industry for 5 years and I feel like I\'m always on call. How do you maintain a healthy work-life balance in tech? Does it get better with seniority or worse? Looking for realistic expectations and strategies.',
      creatorId: '3',
      creatorUsername: 'emily_chen',
      tags: ['Work-Life Balance', 'Mental Health', 'Career', 'Work Culture'],
      reported: false,
      commentCount: 10,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      editedAt: DateTime.now().subtract(const Duration(days: 1, hours: 20)),
    ),
    DiscussionThread(
      id: 10,
      title: 'Contributing to open source: Where to start?',
      body:
          'I want to contribute to open source projects to build my portfolio and give back to the community, but I\'m not sure where to start. How do you find good projects to contribute to? Any tips for first-time contributors?',
      creatorId: '8',
      creatorUsername: 'ryan_patel',
      tags: ['Open Source', 'Career', 'Community', 'Advice'],
      reported: false,
      commentCount: 5,
      createdAt: DateTime.now().subtract(const Duration(hours: 6)),
    ),
  ];

  // Mock comments organized by thread ID
  static final Map<int, List<Comment>> mockCommentsByThread = {
    1: [
      // Comments for "Best practices for technical interviews"
      Comment(
        id: 101,
        body:
            'Great question! I\'ve found that a combination works best. We do a short technical screen (30 min), then a take-home that shouldn\'t take more than 2-3 hours, followed by an onsite with system design and behavioral rounds. The key is respecting candidates\' time.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 2)),
      ),
      Comment(
        id: 102,
        body:
            'I prefer live coding over take-homes because you can see the candidate\'s thought process in real-time. However, I make sure to create a comfortable environment - no trick questions, just real problems we\'ve solved.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 1)),
      ),
      Comment(
        id: 103,
        body:
            'From a candidate perspective, I appreciate when companies are transparent about the interview process upfront. The worst experiences I\'ve had were with surprise whiteboard sessions or excessively long take-homes (8+ hours).',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 22)),
      ),
      Comment(
        id: 104,
        body:
            'Cultural fit is crucial but hard to assess. We do team lunch/coffee chats as part of the process. It\'s informal but gives both sides a chance to see if there\'s a good match beyond just technical skills.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 18)),
      ),
      Comment(
        id: 105,
        body:
            'One thing that worked well for us: pair programming on a real issue from our codebase (with sensitive data removed). Candidates get a real feel for our work, and we see how they collaborate.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 12)),
      ),
      Comment(
        id: 106,
        body:
            'Hot take: Most technical interviews are broken. We focus too much on algorithm puzzles that don\'t reflect actual work. I\'d rather see candidates debug a real issue or review a pull request.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 8)),
      ),
      Comment(
        id: 107,
        body:
            'As someone who\'s been on both sides, the best interviews I\'ve given and received had clear expectations, respectful time limits, and feedback regardless of outcome. Ghosting candidates is never okay.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 4)),
      ),
      Comment(
        id: 108,
        body:
            'We implemented a "work sample" approach - candidates spend 3-4 hours (paid!) working on a simplified version of a real project. Much better signal than whiteboard coding.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 20)),
      ),
    ],
    2: [
      // Comments for "Flutter vs React Native"
      Comment(
        id: 201,
        body:
            'Flutter\'s performance is definitely superior, especially for complex UIs with lots of animations. The hot reload is also slightly faster than RN in my experience. However, React Native has a much larger ecosystem of libraries.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 4)),
      ),
      Comment(
        id: 202,
        body:
            'I switched from RN to Flutter last year and haven\'t looked back. Dart is easy to learn if you know any OOP language. The widget system makes sense once you get used to it. And the performance difference is noticeable on older devices.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
      ),
      Comment(
        id: 203,
        body:
            'React Native\'s advantage is being able to use JavaScript and npm packages. If your team already knows React, the learning curve is minimal. Plus, you can share code with web apps more easily.',
        author: _mockUsers[7], // ryan_patel
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 2)),
      ),
      Comment(
        id: 204,
        body:
            'Consider your hiring needs too. It\'s easier to find React Native developers since JS is so popular. Flutter devs are growing but still less common. That said, good developers can pick up either framework quickly.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 22)),
      ),
      Comment(
        id: 205,
        body:
            'Flutter\'s documentation and error messages are excellent. As someone who learned both, I found Flutter easier to debug and understand what\'s happening under the hood.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 18)),
      ),
      Comment(
        id: 206,
        body:
            'Don\'t forget about platform-specific features. RN might have better third-party support for certain native modules, but Flutter\'s platform channels work well for custom integrations.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 14)),
      ),
      Comment(
        id: 207,
        body:
            'Flutter\'s UI consistency across platforms is amazing. Your iOS and Android apps will look identical (or as identical as you want). With RN, you often need more platform-specific styling.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 10)),
      ),
      Comment(
        id: 208,
        body:
            'I\'ve built production apps in both. For new projects, I lean towards Flutter now. The tooling is more mature, and Google\'s backing gives me confidence in long-term support.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
      Comment(
        id: 209,
        body:
            'React Native\'s Hermes engine has improved performance significantly. The gap isn\'t as wide as it used to be. Both are solid choices - pick based on your team\'s strengths.',
        author: _mockUsers[7], // ryan_patel
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      ),
      Comment(
        id: 210,
        body:
            'Flutter\'s compilation to native code (ARM) is a big win for performance-critical apps. If you\'re building something like a game or graphics-heavy app, Flutter is the clear choice.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Comment(
        id: 211,
        body:
            'One underrated advantage of Flutter: the same code runs on mobile, web, and desktop. React Native web exists but it\'s not as seamless. If you need true cross-platform, Flutter wins.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      Comment(
        id: 212,
        body:
            'Just remember: the best framework is the one your team can maintain. Both have their strengths. I\'d suggest building a small prototype in both and seeing which feels better for your use case.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
      ),
    ],
    3: [
      // Comments for "Transitioning from bootcamp to first job"
      Comment(
        id: 301,
        body:
            'Bootcamp grad here, landed my first job 3 years ago and now I\'m a senior dev. My advice: contribute to open source, write blog posts about what you\'re learning, and network at local meetups. Your bootcamp projects aren\'t enough - show continuous learning.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 17)),
      ),
      Comment(
        id: 302,
        body:
            'As someone who hires devs, I don\'t care about your degree. I care about your ability to solve problems and learn. Focus on building real projects that solve actual problems, not just tutorial clones.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 16)),
      ),
      Comment(
        id: 303,
        body:
            'Network, network, network! I got my first job through a friend I met at a coding meetup. Many positions are filled before they\'re even posted publicly. Make yourself visible in the community.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 14)),
      ),
      Comment(
        id: 304,
        body:
            'Your portfolio matters more than you think. Make sure it showcases your best work with clear READMEs, deployed demos, and clean code. I review GitHub profiles before even reading resumes.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 12)),
      ),
      Comment(
        id: 305,
        body:
            'Don\'t just apply to big tech companies. Startups and smaller companies are often more willing to hire bootcamp grads and give you more hands-on experience early in your career.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 10)),
      ),
      Comment(
        id: 306,
        body:
            'Practice your interview skills! Do mock interviews with friends or use platforms like Pramp. Technical interviews are a skill you can improve with practice, just like coding.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
      ),
      Comment(
        id: 307,
        body:
            'Consider freelancing or contract work initially. It\'s easier to land and gives you professional experience to put on your resume. Plus you\'ll learn what kind of work environment you prefer.',
        author: _mockUsers[7], // ryan_patel
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
      Comment(
        id: 308,
        body:
            'Learn CS fundamentals even though your bootcamp might have skipped them. Understanding data structures, algorithms, and how computers work will make you a better developer and help in interviews.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      ),
      Comment(
        id: 309,
        body:
            'Don\'t get discouraged by rejection. I applied to 100+ jobs before getting my first offer. Every rejection is practice for the next interview. Keep improving and iterating on your approach.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      Comment(
        id: 310,
        body:
            'Build something unique that you\'re passionate about. When I interview candidates, the ones who built a project because they genuinely wanted to solve a problem always stand out. Passion is contagious.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Comment(
        id: 311,
        body:
            'Join coding challenges and hackathons. They\'re great for learning, networking, and adding to your portfolio. Plus, many companies recruit directly from these events.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      Comment(
        id: 312,
        body:
            'Remember that everyone starts somewhere. That senior dev with 10 years of experience? They were in your shoes once. Stay humble, keep learning, and don\'t be afraid to ask questions.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 45)),
      ),
      Comment(
        id: 313,
        body:
            'Specialize in one technology stack initially. Being a \"full-stack developer who knows everything\" as a junior is a red flag. Go deep in React or Vue or whatever you like, then expand.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
      ),
      Comment(
        id: 314,
        body:
            'Your soft skills matter as much as technical skills. Communication, teamwork, and the ability to receive feedback gracefully will set you apart from other candidates.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 20)),
      ),
      Comment(
        id: 315,
        body:
            'Consider reaching out to bootcamp alumni who got jobs. Most people are happy to help and might even refer you at their companies. Referrals dramatically increase your chances.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
      ),
    ],
    4: [
      // Comments for "Remote work policies"
      Comment(
        id: 401,
        body:
            'We switched to hybrid (3 days in office, 2 remote) and it seems to be working well. People get the collaboration benefits of in-person while maintaining some flexibility.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 11)),
      ),
      Comment(
        id: 402,
        body:
            'Fully remote here and loving it. Productivity is up, and we\'ve been able to hire talent from anywhere. The key is having good async communication practices and regular video check-ins.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 10)),
      ),
      Comment(
        id: 403,
        body:
            'Our company tried to force RTO and lost 30% of engineering team. Now we\'re scrambling to offer remote again. Companies need to understand that the genie is out of the bottle.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
      ),
      Comment(
        id: 404,
        body:
            'I prefer full-time office personally. The spontaneous conversations and whiteboard sessions can\'t be replicated remotely. But I understand I\'m in the minority on this.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
      Comment(
        id: 405,
        body:
            'The best policy is flexibility. Let teams decide what works for them. Some projects need more collaboration, others work fine async. Trust your employees to make the right choice.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      ),
      Comment(
        id: 406,
        body:
            'Remote-first with optional office space is ideal. People can come in when they want but don\'t feel pressured. We maintain documentation culture since not everyone is in the same place.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
    ],
    5: [
      // Comments for "Machine Learning career path"
      Comment(
        id: 501,
        body:
            'I specialized in NLP and it\'s opened doors. Deep expertise is valued, and you can always broaden later. It\'s harder to go from shallow in everything to deep in something.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 20)),
      ),
      Comment(
        id: 502,
        body:
            'Counterpoint: stay broad early in your career. You don\'t know what you\'ll enjoy long-term. I thought I wanted computer vision but ended up loving recommendation systems.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 18)),
      ),
      Comment(
        id: 503,
        body:
            'The market rewards specialists at senior levels. If you want to become a principal ML engineer or research scientist, you need deep expertise in something. Generalists top out earlier.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 16)),
      ),
      Comment(
        id: 504,
        body:
            'Focus on fundamentals over specific techniques. ML is evolving rapidly. Understanding underlying math and statistics will serve you better than knowing the hot framework of the moment.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 12)),
      ),
      Comment(
        id: 505,
        body:
            'I did both - specialized in computer vision but maintained side projects in other areas. This gave me depth for my career while keeping options open. Balance is key.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 8)),
      ),
      Comment(
        id: 506,
        body:
            'Consider the industry you want to work in. Healthcare ML is different from finance ML. Aligning your specialization with your target industry helps a lot.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 4)),
      ),
      Comment(
        id: 507,
        body:
            'Don\'t forget about MLOps! There\'s huge demand for people who can bridge ML research and production deployment. It\'s a great niche that combines broad and deep skills.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Comment(
        id: 508,
        body:
            'Build a portfolio that shows both depth and breadth. Have one or two projects where you went really deep, and several showing you can work across different domains.',
        author: _mockUsers[7], // ryan_patel
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 20)),
      ),
      Comment(
        id: 509,
        body:
            'Network with people in different ML specializations. Understanding what others do helps you find your niche. Plus, collaboration across specialties often produces the best results.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 16)),
      ),
    ],
    6: [
      // Comments for "DevOps tools landscape 2025"
      Comment(
        id: 601,
        body:
            'Terraform for IaC is non-negotiable. Jenkins is showing its age - look at GitHub Actions or GitLab CI instead. Kubernetes is still king for container orchestration.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 1)),
      ),
      Comment(
        id: 602,
        body:
            'Don\'t sleep on observability! Prometheus + Grafana for metrics, ELK stack for logs, and Jaeger for tracing. You can\'t operate what you can\'t measure.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 23)),
      ),
      Comment(
        id: 603,
        body:
            'ArgoCD for GitOps has been a game-changer for us. Declarative deployments with Git as the source of truth makes everything more reliable and auditable.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 20)),
      ),
      Comment(
        id: 604,
        body:
            'Security tools are essential now. Integrate Snyk or Trivy for vulnerability scanning, and use tools like Vault for secrets management. Security can\'t be an afterthought.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 16)),
      ),
      Comment(
        id: 605,
        body:
            'Cloud-specific tools are worth learning. AWS CDK, Azure DevOps, or GCP Cloud Build can be more integrated than generic tools for cloud-native apps.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 12)),
      ),
      Comment(
        id: 606,
        body:
            'Backstage by Spotify for internal developer platforms is gaining traction. It helps manage the complexity when you have dozens of microservices.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
      ),
      Comment(
        id: 607,
        body:
            'Don\'t over-engineer. Start simple and add complexity as needed. I\'ve seen teams adopt every hot tool and end up with an unmaintainable mess.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
      Comment(
        id: 608,
        body:
            'Ansible still has its place for configuration management, especially in hybrid cloud/on-prem environments. Don\'t dismiss the \"older\" tools completely.',
        author: _mockUsers[7], // ryan_patel
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      ),
      Comment(
        id: 609,
        body:
            'Learn the principles, not just the tools. Understanding CI/CD concepts, IaC philosophy, and observability patterns matters more than knowing every tool.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Comment(
        id: 610,
        body:
            'Crossplane is interesting for managing cloud resources via Kubernetes. If you\'re all-in on K8s, it provides a unified control plane for everything.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      Comment(
        id: 611,
        body:
            'Policy as Code tools like OPA (Open Policy Agent) are becoming important for governance at scale. Definitely worth adding to your toolkit.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
      ),
    ],
    7: [
      // Comments for "Salary negotiation strategies"
      Comment(
        id: 701,
        body:
            'Use Levels.fyi, Glassdoor, and Blind to research salaries. Come with data, not just a feeling. \"Market rate for this role is X based on these sources\" is much stronger than \"I think I deserve more.\"',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 7)),
      ),
      Comment(
        id: 702,
        body:
            'Never accept the first offer. Even if it\'s good, always negotiate. The worst they can say is no, and most companies expect some back-and-forth. I got an extra \$15k just by asking.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
      Comment(
        id: 703,
        body:
            'Negotiate total compensation, not just salary. Equity, bonus, signing bonus, PTO, remote work allowance - all of these have value. Sometimes companies are more flexible on equity than base.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      Comment(
        id: 704,
        body:
            'Have competing offers if possible. Nothing strengthens your negotiating position like being able to say "Company Y offered \$X." Just be honest and professional about it.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      ),
      Comment(
        id: 705,
        body:
            'Frame it positively. "I\'m excited about this opportunity and want to make it work. Based on my research and experience, I was expecting closer to \$X." Not "That\'s too low."',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      Comment(
        id: 706,
        body:
            'Don\'t reveal your current salary or desired salary early in the process. Let them make the first offer. If pressed, give a wide range based on market research.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Comment(
        id: 707,
        body:
            'Know your walk-away number before negotiating. It\'s easier to negotiate confidently when you know you\'re willing to decline if they can\'t meet your requirements.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      Comment(
        id: 708,
        body:
            'Consider the whole package including growth opportunities, work-life balance, and learning. Sometimes a slightly lower salary at a better company is the right move for your career.',
        author: _mockUsers[7], // ryan_patel
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 45)),
      ),
      Comment(
        id: 709,
        body:
            'Get everything in writing before accepting. I\'ve seen offers change between verbal and written. Review the offer letter carefully and ask questions about anything unclear.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
      ),
      Comment(
        id: 710,
        body:
            'Timing matters. Negotiate before you start, not after. Once you\'ve accepted and started, your leverage is gone. The best time to negotiate is between offer and acceptance.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 20)),
      ),
      Comment(
        id: 711,
        body:
            'Be prepared to justify your ask with specific value you bring. "I have 5 years of experience in X, led projects that generated \$Y in value, and bring expertise in Z."',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 15)),
      ),
      Comment(
        id: 712,
        body:
            'Don\'t burn bridges if negotiation doesn\'t work out. Stay professional. You might want to work there in the future, or the recruiter might move to another company.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
      ),
      Comment(
        id: 713,
        body:
            'Women and underrepresented minorities: negotiate! Studies show you\'re less likely to negotiate than your peers, which contributes to pay gaps. You deserve fair compensation.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 5)),
      ),
      Comment(
        id: 714,
        body:
            'If they can\'t budge on salary, negotiate other things: more PTO, sign-on bonus, earlier review cycle, professional development budget, better title. Everything is negotiable.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 2)),
      ),
    ],
    8: [
      // Comments for "Building a cloud-native architecture from scratch"
      Comment(
        id: 801,
        body:
            'Start with AWS if you want the most features and maturity. GCP if you want the best Kubernetes experience. Azure if you\'re in a Microsoft ecosystem. They\'re all good - pick based on your team\'s expertise.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      Comment(
        id: 802,
        body:
            'Don\'t go multi-region on day one unless you absolutely need it. Start simple, prove the product, then scale. Premature optimization killed more startups than lack of scalability.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(
          const Duration(hours: 2, minutes: 45),
        ),
      ),
      Comment(
        id: 803,
        body:
            'Use managed services wherever possible. Managed databases, managed Kubernetes, managed message queues. Your team should focus on building product, not ops.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(
          const Duration(hours: 2, minutes: 30),
        ),
      ),
      Comment(
        id: 804,
        body:
            'Implement observability from day one. It\'s much harder to retrofit. Use cloud-native monitoring tools or popular third-party solutions like Datadog or New Relic.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Comment(
        id: 805,
        body:
            'Infrastructure as Code is non-negotiable. Use Terraform or your cloud provider\'s native tools (CloudFormation, ARM templates). Your infra should be version controlled and reproducible.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(
          const Duration(hours: 1, minutes: 30),
        ),
      ),
      Comment(
        id: 806,
        body:
            'Design for failure from the start. Use circuit breakers, retries with exponential backoff, and proper error handling. Everything fails in the cloud, plan for it.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      Comment(
        id: 807,
        body:
            'Cost optimization matters. Use reserved instances or savings plans, implement auto-scaling, and monitor your cloud bill closely. Cloud costs can spiral quickly if you\'re not careful.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
      ),
    ],
    9: [
      // Comments for "Work-life balance in tech"
      Comment(
        id: 901,
        body:
            'It\'s not a myth, but it\'s rare and you have to be intentional about it. Set boundaries early, don\'t respond to Slack after hours unless it\'s critical, and use your PTO.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 22)),
      ),
      Comment(
        id: 902,
        body:
            'Company culture matters more than anything. I\'ve worked at places where 60-hour weeks were the norm and others where 40 hours was respected. Choose your employer carefully.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 20)),
      ),
      Comment(
        id: 903,
        body:
            'Remote work has helped me achieve better balance. No commute means more time for family and hobbies. But you have to be disciplined about \"closing\" your laptop at a reasonable hour.',
        author: _mockUsers[7], // ryan_patel
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 18)),
      ),
      Comment(
        id: 904,
        body:
            'Seniority can help. As a senior engineer, I have more leverage to push back on unreasonable demands. But I\'ve also seen senior people work themselves to death. It\'s a choice.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 16)),
      ),
      Comment(
        id: 905,
        body:
            'Burnout is real and it\'s not worth it. I burned out hard at my last job and it took me a year to recover. Now I prioritize balance over promotions or extra money.',
        author: _mockUsers[4], // jessica_lee
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 14)),
      ),
      Comment(
        id: 906,
        body:
            'Find a company that values output over hours. I judge my team on results, not time logged. If you finish your work in 35 hours, great! Take Friday afternoon off.',
        author: _mockUsers[6], // lisa_martinez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 12)),
      ),
      Comment(
        id: 907,
        body:
            'The on-call rotation is the biggest challenge for me. Interrupted sleep is terrible for quality of life. Make sure on-call is properly compensated and rotated fairly.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 10)),
      ),
      Comment(
        id: 908,
        body:
            'European tech companies generally have better work-life balance than US companies. If it\'s important to you, consider location. 35-hour weeks and 25+ days of PTO are normal in some countries.',
        author: _mockUsers[3], // michael_brown
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 8)),
      ),
      Comment(
        id: 909,
        body:
            'Have hobbies outside of coding. I climb and play music - it keeps me sane. If your entire identity is wrapped up in work, you\'ll never achieve balance.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 6)),
      ),
      Comment(
        id: 910,
        body:
            'Watch for red flags in interviews: \"we\'re like a family,\" \"we work hard and play hard,\" \"unlimited PTO\" (often means no PTO). Ask current employees about their typical hours.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 4)),
      ),
    ],
    10: [
      // Comments for "Contributing to open source"
      Comment(
        id: 1001,
        body:
            'Start with projects you already use. You understand the domain, you can test changes, and you\'re motivated because you benefit from improvements. Look for \"good first issue\" labels.',
        author: _mockUsers[7], // ryan_patel
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      Comment(
        id: 1002,
        body:
            'Documentation contributions are underrated. Many projects need help with docs, examples, and tutorials. It\'s a great way to start contributing without deep code knowledge.',
        author: _mockUsers[2], // emily_chen
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      ),
      Comment(
        id: 1003,
        body:
            'Don\'t just fix typos. While appreciated, meaningful contributions like bug fixes or feature implementations will teach you more and look better on your profile.',
        author: _mockUsers[0], // sarah_johnson
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      Comment(
        id: 1004,
        body:
            'Read the contributing guidelines carefully. Every project has different expectations for PRs, commit messages, and testing. Following their process increases your chance of acceptance.',
        author: _mockUsers[5], // david_kim
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Comment(
        id: 1005,
        body:
            'Be patient with maintainers. Many are volunteers doing this in their spare time. If your PR sits for weeks, it\'s not personal - they\'re overwhelmed. A gentle ping is okay after a while.',
        author: _mockUsers[1], // alex_rodriguez
        reported: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
    ],
  };

  // Mock tags for filtering
  static final List<String> mockTags = [
    'Interview',
    'Career',
    'Best Practices',
    'Flutter',
    'React Native',
    'Mobile Development',
    'Technology',
    'Job Search',
    'Bootcamp',
    'Advice',
    'Remote Work',
    'Work Culture',
    'Company Policy',
    'Machine Learning',
    'Data Science',
    'Career Growth',
    'DevOps',
    'Tools',
    'Infrastructure',
    'Salary',
    'Negotiation',
    'Cloud',
    'Architecture',
    'AWS',
    'Work-Life Balance',
    'Mental Health',
    'Open Source',
    'Community',
  ];

  /// Simulates fetching discussion threads from API
  static Future<List<DiscussionThread>> fetchThreads() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 800));
    return List.from(mockThreads);
  }

  /// Simulates fetching comments for a specific thread
  static Future<List<Comment>> fetchComments(int threadId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 600));
    return List.from(mockCommentsByThread[threadId] ?? []);
  }

  /// Simulates fetching available tags
  static Future<List<String>> fetchTags() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 400));
    return List.from(mockTags);
  }
}
