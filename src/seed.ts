import mongoose from "mongoose";
import dotenv from "dotenv";
import { Destination } from "./models/Destination.model";
import { User } from "./models/User.model";
import bcrypt from "bcryptjs";

dotenv.config();

// Expanded to 20 unique locations
const locations = [
  { city: "Malé", country: "Maldives", category: "Beach" },
  { city: "Zermatt", country: "Switzerland", category: "Mountain" },
  { city: "Tokyo", country: "Japan", category: "Urban" },
  { city: "Merzouga", country: "Morocco", category: "Desert" },
  { city: "Ubud", country: "Indonesia", category: "Mountain" },
  { city: "Santorini", country: "Greece", category: "Beach" },
  { city: "New York", country: "USA", category: "Urban" },
  { city: "Banff", country: "Canada", category: "Mountain" },
  { city: "Dubai", country: "UAE", category: "Urban" },
  { city: "Phuket", country: "Thailand", category: "Beach" },
  { city: "Reykjavik", country: "Iceland", category: "Mountain" },
  { city: "Marrakech", country: "Morocco", category: "Urban" },
  { city: "Bora Bora", country: "French Polynesia", category: "Beach" },
  { city: "Aspen", country: "USA", category: "Mountain" },
  { city: "Cairo", country: "Egypt", category: "Desert" },
  { city: "Barcelona", country: "Spain", category: "Urban" },
  { city: "Maui", country: "USA", category: "Beach" },
  { city: "Queenstown", country: "New Zealand", category: "Mountain" },
  { city: "Wadi Rum", country: "Jordan", category: "Desert" },
  { city: "Rio de Janeiro", country: "Brazil", category: "Beach" },
];

const adjectives = [
  "Luxury",
  "Cozy",
  "Modern",
  "Secluded",
  "Vibrant",
  "Eco-Friendly",
  "Historic",
  "Minimalist",
  "Penthouse",
  "Treehouse",
  "Rustic",
  "Chic",
  "Opulent",
  "Tranquil",
  "Adventure",
];
const types = [
  "Villa",
  "Cabin",
  "Apartment",
  "Suite",
  "Camp",
  "Loft",
  "Bungalow",
  "Resort",
  "Lodge",
  "Tent",
];
const tagsPool = [
  "Luxury",
  "Honeymoon",
  "Family",
  "Solo",
  "Adventure",
  "Romantic",
  "Budget",
  "Skiing",
  "Beachfront",
  "City Center",
  "Nature",
  "Pool",
  "All-Inclusive",
  "Pet-Friendly",
  "Spa",
];

// Generates a unique image URL for each index
const getImage = (index: number) => {
  return [`https://picsum.photos/seed/nomadai${index}/800/600`];
};

const generateDescription = (
  adj: string,
  type: string,
  city: string,
  country: string,
  index: number,
) => {
  const intros = [
    `Welcome to this ${adj.toLowerCase()} ${type.toLowerCase()} in ${city}.`,
    `Discover the magic of ${country} in this unique ${type.toLowerCase()}.`,
    `Property ID #${1000 + index}: A premium ${adj.toLowerCase()} ${type.toLowerCase()} waiting for you in ${city}.`,
    `Escape to ${city} and stay in this beautifully designed ${type.toLowerCase()}.`,
  ];
  const bodies = [
    `It offers breathtaking views, modern amenities, and easy access to local attractions. Perfectly designed for comfort and style.`,
    `The space features high-end finishes, a fully equipped kitchen, and a relaxing lounge area. Step outside to experience the vibrant local culture.`,
    `Nested in a prime location, this property is an ideal base for your adventures. Enjoy premium facilities and unforgettable sunsets right from your window.`,
    `Whether you are looking for a romantic getaway or a family vacation, this property provides everything you need for a memorable stay.`,
  ];
  return `${intros[index % intros.length]} ${bodies[index % bodies.length]}`;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB Atlas for Seeding...");

    await Destination.deleteMany({});
    console.log("Cleared existing destinations...");

    let host = await User.findOne({ email: "host@nomadai.com" });
    if (!host) {
      host = await User.create({
        name: "NomadAI Host",
        email: "host@nomadai.com",
        password: await bcrypt.hash("password123", 10),
        role: "admin",
      });
    }

    const destinationsToInsert = [];

    for (let i = 0; i < 100; i++) {
      const loc = locations[i % locations.length]; // Cycles through 20 locations
      const adj = adjectives[i % adjectives.length]; // Cycles through 15 adjectives
      const type = types[i % types.length]; // Cycles through 10 types

      // Create unique combinations of tags
      const tag1 = tagsPool[i % tagsPool.length];
      const tag2 = tagsPool[(i + 3) % tagsPool.length];
      const tag3 = tagsPool[(i + 7) % tagsPool.length];
      const selectedTags = [tag1, tag2, tag3];

      destinationsToInsert.push({
        title: `${adj} ${type} in ${loc.city}`,
        short_desc: `Property #${i + 1}: A beautiful ${type.toLowerCase()} in ${loc.country}.`,
        full_desc: generateDescription(adj, type, loc.city, loc.country, i),
        price: (i + 1) * 17 + 50, // Generates unique prices from $67 up to $1750
        location: `${loc.city}, ${loc.country}`,
        category: loc.category,
        rating: Math.round((3.5 + (i % 15) / 10) * 10) / 10, // Generates varying ratings between 3.5 and 5.0
        images: getImage(i), // Unique image per index
        tags: selectedTags,
        createdBy: host._id,
      });
    }

    await Destination.insertMany(destinationsToInsert);
    console.log(
      `🎉 Successfully inserted 100 unique destinations into MongoDB Atlas!`,
    );

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedDB();
