const mongoose = require("mongoose");
require("dotenv").config();
const Campaign = require("./models/Campaign");

const sampleCampaigns = [
  {
    _id: "6a34c83ba1cf88e7e75f4131",
    title: "Education Support for Rural Students",
    description: "Provide quality educational resources, digital tablets, and school supplies for underprivileged children in village schools.",
    goalAmount: 50000,
    raisedAmount: 35000,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    category: "Education",
    createdBy: "EduHelp Foundation",
  },
  {
    _id: "6a34d95f25cb936b2db38763",
    title: "Emergency Medical & Cancer Treatment Care",
    description: "Financial assistance for critical surgeries, cancer treatments, and hospital medicine for low-income patients.",
    goalAmount: 150000,
    raisedAmount: 42000,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309",
    category: "Healthcare",
    createdBy: "Hope Health Trust",
  },
  {
    _id: "6a3116556c06305f53248cbe",
    title: "Daily Meal Ration Kits for Needy Families",
    description: "Distribute monthly essential food ration packets to daily wage workers and marginalized families facing hunger.",
    goalAmount: 60000,
    raisedAmount: 28500,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    category: "Food",
    createdBy: "Feed The Hungry NGO",
  },
  {
    _id: "6a34e5a04446061cc853ca4e",
    title: "Clean Drinking Water & Rural Infrastructure",
    description: "Build deep solar borewells and rainwater harvesting tanks to bring clean drinking water to drought-hit villages.",
    goalAmount: 80000,
    raisedAmount: 32000,
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7",
    category: "Rural Development",
    createdBy: "Gramin Uplift Trust",
  },
  {
    _id: "6a35f11122aa33bb44cc55dd",
    title: "Stray Animal Rescue & Medical Shelter Care",
    description: "Provide emergency veterinary treatment, vaccinations, and safe shelter food for injured street dogs and animals.",
    goalAmount: 40000,
    raisedAmount: 18000,
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c",
    category: "Animal Welfare",
    createdBy: "Paws & Paws Rescue",
  },
  {
    _id: "6a35f22233bb44cc55dd66ee",
    title: "Tree Plantation & Reforestation Drive",
    description: "Planting 10,000 native saplings in degraded forest areas to fight air pollution and restore eco-balance.",
    goalAmount: 50000,
    raisedAmount: 24000,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
    category: "Environment",
    createdBy: "Green Earth Coalition",
  },
  {
    _id: "6a35f33344cc55dd66ee77ff",
    title: "Disaster Emergency Flood Relief Fund",
    description: "Providing dry rations, clean drinking water kits, tarpaulins, and medical supplies to flood victims.",
    goalAmount: 100000,
    raisedAmount: 65000,
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5",
    category: "Disaster Relief",
    createdBy: "Rapid Relief Force",
  },
  {
    _id: "6a35f44455dd66ee77ff88aa",
    title: "Women Empowerment & Vocational Skill Training",
    description: "Training rural women in tailoring, handicrafts, and micro-business management for self-reliance and economic freedom.",
    goalAmount: 70000,
    raisedAmount: 41000,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    category: "Women Empowerment",
    createdBy: "Nari Shakti Foundation",
  },
  {
    _id: "6a35f55566ee77ff88bb99bb",
    title: "Nutrition & Schooling Support for Orphaned Children",
    description: "Supporting orphan children with healthy meals, warm clothes, books, and loving shelter care.",
    goalAmount: 90000,
    raisedAmount: 53000,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    category: "Children",
    createdBy: "Child Bright Hope",
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-donation-platform";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding campaigns...");

    for (const c of sampleCampaigns) {
      await Campaign.findByIdAndUpdate(c._id, c, { upsert: true, new: true });
    }

    console.log(`✓ Successfully seeded ${sampleCampaigns.length} campaigns into local MongoDB!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
