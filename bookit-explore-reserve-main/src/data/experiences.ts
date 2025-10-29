import { Experience } from "@/types/experience";

export const experiences: Experience[] = [
  {
    id: "kayaking-udupi",
    title: "Kayaking",
    location: "Udupi",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription: "Curated small-group experience. Certified guide. Safety first with gear included. Helmet and Life jackets along with an expert will accompany in kayaking.",
    price: 999,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    category: "Adventure",
    borderColor: "border-green-500",
    availableDates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    availableTimes: [
      { time: "07:00 am", available: 4 },
      { time: "09:00 am", available: 2 },
      { time: "11:00 am", available: 5 },
      { time: "01:00 pm", soldOut: true, available: 0 }
    ]
  },
  {
    id: "nandi-hills-sunrise-bangalore",
    title: "Nandi Hills Sunrise",
    location: "Bangalore",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription: "Experience the breathtaking sunrise from Nandi Hills with our expert guides. Enjoy the cool morning breeze and panoramic views of the valley below.",
    price: 899,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "Nature",
    availableDates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    availableTimes: [
      { time: "05:00 am", available: 8 },
      { time: "05:30 am", available: 6 }
    ]
  },
  {
    id: "coffee-trail-coorg",
    title: "Coffee Trail",
    location: "Coorg",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription: "Walk through lush coffee plantations, learn about coffee cultivation, and enjoy fresh brews straight from the estate.",
    price: 1299,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
    category: "Nature",
    availableDates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    availableTimes: [
      { time: "08:00 am", available: 10 },
      { time: "10:00 am", available: 8 },
      { time: "02:00 pm", available: 5 }
    ]
  },
  {
    id: "kayaking-karnataka",
    title: "Kayaking",
    location: "Udupi, Karnataka",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription: "Navigate through serene backwaters and mangrove forests with professional kayaking instructors. Perfect for beginners and experts alike.",
    price: 999,
    image: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&q=80",
    category: "Adventure",
    borderColor: "border-purple-500",
    availableDates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    availableTimes: [
      { time: "07:00 am", available: 4 },
      { time: "09:00 am", available: 2 },
      { time: "11:00 am", available: 5 }
    ]
  },
  {
    id: "nandi-hills-sunrise-2",
    title: "Nandi Hills Sunrise",
    location: "Bangalore",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription: "Witness the magical golden hour from one of Bangalore's most iconic viewpoints. Includes transportation and breakfast.",
    price: 899,
    image: "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=800&q=80",
    category: "Nature",
    availableDates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    availableTimes: [
      { time: "05:00 am", available: 8 },
      { time: "05:30 am", available: 6 }
    ]
  },
  {
    id: "boat-cruise-sunderbans",
    title: "Boat Cruise",
    location: "Sunderbans",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription: "Explore the UNESCO World Heritage Sunderbans mangrove forest on a comfortable boat cruise. Spot wildlife and enjoy nature.",
    price: 999,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    category: "Adventure",
    borderColor: "border-blue-500",
    badge: {
      text: "Dark Knight",
      color: "bg-yellow-400 text-black"
    },
    availableDates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    availableTimes: [
      { time: "09:00 am", available: 15 },
      { time: "02:00 pm", available: 12 }
    ]
  },
  {
    id: "bunjee-jumping-manali",
    title: "Bunjee Jumping",
    location: "Manali",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription: "Take the leap with India's highest bungee jump! Professional instructors and world-class safety equipment ensure an unforgettable experience.",
    price: 999,
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    category: "Extreme",
    availableDates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    availableTimes: [
      { time: "10:00 am", available: 6 },
      { time: "12:00 pm", available: 4 },
      { time: "02:00 pm", available: 6 }
    ]
  },
  {
    id: "coffee-trail-prajwal",
    title: "Coffee Trail",
    location: "Coorg",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    longDescription: "Immerse yourself in the aromatic world of coffee. Learn the process from bean to cup and taste premium estate coffee.",
    price: 1299,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
    category: "Nature",
    borderColor: "border-pink-500",
    badge: {
      text: "Prajwal",
      color: "bg-pink-500 text-white"
    },
    availableDates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    availableTimes: [
      { time: "08:00 am", available: 10 },
      { time: "10:00 am", available: 8 },
      { time: "02:00 pm", available: 5 }
    ]
  }
];
