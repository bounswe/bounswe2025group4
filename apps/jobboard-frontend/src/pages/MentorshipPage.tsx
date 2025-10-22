import MentorCard from "@/components/mentorship/MentorCard";
import { type Mentor } from "@/types/mentor";

const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Alice Johnson",
    title: "Senior Software Engineer at Google",
    bio: "I have 10 years of experience in software development and I'm passionate about helping new developers grow. I specialize in React, TypeScript, and building scalable applications.",
    rating: 4.9,
    reviews: 45,
    mentees: 3,
    capacity: 5,
    tags: ["React", "TypeScript", "Career Advice", "Interview Prep"],
    experience: "10+ years in software development",
    education: "MS Computer Science, Stanford University",
    linkedinUrl: "https://linkedin.com/in/alicejohnson",
    githubUrl: "https://github.com/alicejohnson",
    websiteUrl: "https://alicejohnson.dev",
    hourlyRate: 150,
    availability: "Monday-Friday, 6-9 PM PST",
    languages: ["English", "Spanish"],
    specialties: ["Frontend Development", "System Design", "Career Growth"],
    achievements: [
      "Led development of Google's main search interface",
      "Published 15+ technical articles",
      "Speaker at React Conf 2023"
    ],
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "2",
    name: "Bob Williams",
    title: "Product Manager at Microsoft",
    bio: "I can help you with product sense, interview preparation, and career transition into product management. I've launched multiple successful products and mentored 20+ PMs.",
    rating: 4.7,
    reviews: 28,
    mentees: 5,
    capacity: 5,
    tags: ["Product Management", "Interview Prep", "Strategy"],
    experience: "8+ years in product management",
    education: "MBA, Harvard Business School",
    linkedinUrl: "https://linkedin.com/in/bobwilliams",
    hourlyRate: 120,
    availability: "Tuesday-Thursday, 7-9 PM EST",
    languages: ["English"],
    specialties: ["Product Strategy", "User Research", "Go-to-Market"],
    achievements: [
      "Launched 3 successful products at Microsoft",
      "Mentored 20+ PMs",
      "Featured in Product Management Weekly"
    ],
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "3",
    name: "Charlie Brown",
    title: "UX Designer at Apple",
    bio: "I specialize in user-centered design and can provide feedback on your portfolio and design process. I've designed interfaces for millions of users worldwide.",
    rating: 4.8,
    reviews: 62,
    mentees: 1,
    capacity: 3,
    tags: ["UX Design", "Portfolio Review", "User Research"],
    experience: "6+ years in UX design",
    education: "BFA Design, Art Center College of Design",
    linkedinUrl: "https://linkedin.com/in/charliebrown",
    websiteUrl: "https://charliebrown.design",
    hourlyRate: 100,
    availability: "Monday-Wednesday, 5-8 PM PST",
    languages: ["English", "French"],
    specialties: ["User Research", "Prototyping", "Design Systems"],
    achievements: [
      "Designed Apple's latest iOS interface",
      "Portfolio featured in Design Annual",
      "Speaker at UX Design Conference"
    ],
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "4",
    name: "Diana Martinez",
    title: "Data Scientist at Netflix",
    bio: "I help aspiring data scientists break into the field and advance their careers. I specialize in machine learning, Python, and data visualization.",
    rating: 4.6,
    reviews: 34,
    mentees: 2,
    capacity: 4,
    tags: ["Data Science", "Python", "Machine Learning"],
    experience: "7+ years in data science",
    education: "PhD Statistics, MIT",
    linkedinUrl: "https://linkedin.com/in/dianamartinez",
    githubUrl: "https://github.com/dianamartinez",
    hourlyRate: 130,
    availability: "Weekends, Flexible schedule",
    languages: ["English", "Spanish"],
    specialties: ["Machine Learning", "Data Visualization", "Career Transition"],
    achievements: [
      "Built recommendation system for Netflix",
      "Published in top-tier ML journals",
      "Kaggle Grandmaster"
    ],
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "5",
    name: "Ethan Chen",
    title: "DevOps Engineer at Amazon",
    bio: "I specialize in cloud infrastructure, CI/CD pipelines, and helping developers understand DevOps best practices. I've scaled systems for millions of users.",
    rating: 4.5,
    reviews: 19,
    mentees: 4,
    capacity: 6,
    tags: ["DevOps", "AWS", "Docker", "Kubernetes"],
    experience: "9+ years in DevOps",
    education: "BS Computer Engineering, UC Berkeley",
    linkedinUrl: "https://linkedin.com/in/ethanchen",
    githubUrl: "https://github.com/ethanchen",
    hourlyRate: 140,
    availability: "Monday-Friday, 8-10 PM EST",
    languages: ["English", "Mandarin"],
    specialties: ["Cloud Infrastructure", "CI/CD", "System Scaling"],
    achievements: [
      "Scaled Amazon's infrastructure globally",
      "Open source contributor",
      "AWS Solutions Architect"
    ],
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }
];

const MentorshipPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Find a Mentor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </div>
  );
};

export default MentorshipPage;
