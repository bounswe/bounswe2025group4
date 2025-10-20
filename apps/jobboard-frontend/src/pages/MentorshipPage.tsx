import MentorCard from "@/components/mentorship/MentorCard";
import { type Mentor } from "@/types/mentor";

const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Alice Johnson",
    title: "Senior Software Engineer at Google",
    bio: "I have 10 years of experience in software development and I'm passionate about helping new developers grow.",
    rating: 5,
    reviews: 45,
    mentees: 3,
    capacity: 5,
    tags: ["React", "TypeScript", "Career Advice"],
  },
  {
    id: "2",
    name: "Bob Williams",
    title: "Product Manager at Microsoft",
    bio: "I can help you with product sense, interview preparation, and career transition into product management.",
    rating: 4,
    reviews: 28,
    mentees: 5,
    capacity: 5,
    tags: ["Product Management", "Interview Prep"],
  },
  {
    id: "3",
    name: "Charlie Brown",
    title: "UX Designer at Apple",
    bio: "I specialize in user-centered design and can provide feedback on your portfolio and design process.",
    rating: 5,
    reviews: 62,
    mentees: 1,
    capacity: 3,
    tags: ["UX Design", "Portfolio Review"],
  },
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
