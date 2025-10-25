

const mongoose = require('mongoose');
const Incident = require('./models/incident.model'); // adjust path if needed

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb://localhost:27017/scam';

const sampleScams = [
    {
        title: "UPI Fraud - Fake Refund Request",
        description: "Victim received a fake UPI collect request disguised as a refund.",
        location: "Mumbai",
        pincode: "400001",
        coordinates: { latitude: 18.9388, longitude: 72.8354 },
        scammerDetails: {
          phoneNumber: "+919876543210",
          upiId: "fraud@upi",
          scamType: "upi-fraud",
          description: "Sent fake UPI collect request"
        },
        severity: "high",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/upi_fraud.png"
      },
      {
        title: "Phishing Email - Bank KYC",
        description: "Email claimed to be from SBI asking to update KYC via link.",
        location: "Delhi",
        pincode: "110001",
        coordinates: { latitude: 28.6139, longitude: 77.2090 },
        scammerDetails: {
          email: "fakebank@suspicious.com",
          scamType: "phishing",
          description: "Phishing email with fake KYC link"
        },
        severity: "critical",
        status: "under review",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/phishing_email.png"
      },
      {
        title: "Investment Scam - Fake Crypto Platform",
        description: "Victim lured into depositing money into a fake crypto trading app.",
        location: "Bengaluru",
        pincode: "560001",
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
        scammerDetails: {
          website: "fakecrypto.in",
          scamType: "investment",
          description: "Fake crypto trading platform"
        },
        severity: "critical",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/fake_crypto.png"
      },
      {
        title: "Romance Scam - Dating App",
        description: "Scammer built trust on a dating app and asked for money citing medical emergency.",
        location: "Pune",
        pincode: "411001",
        coordinates: { latitude: 18.5204, longitude: 73.8567 },
        scammerDetails: {
          name: "Anjali",
          scamType: "romance",
          description: "Pretended to be in love, asked for urgent funds"
        },
        severity: "high",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/romance_scam.png"
      },
      {
        title: "Tech Support Scam - Fake Microsoft Call",
        description: "Caller claimed to be Microsoft support, asked victim to install remote access software.",
        location: "Hyderabad",
        pincode: "500001",
        coordinates: { latitude: 17.3850, longitude: 78.4867 },
        scammerDetails: {
          phoneNumber: "+911234567890",
          scamType: "tech-support",
          description: "Pretended to be Microsoft support"
        },
        severity: "medium",
        status: "under review",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/tech_support.png"
      },
      {
        title: "Fake Job Offer Scam",
        description: "Victim was promised a high-paying job but asked to pay a registration fee.",
        location: "Chennai",
        pincode: "600001",
        coordinates: { latitude: 13.0827, longitude: 80.2707 },
        scammerDetails: {
          email: "hr@fakejobs.com",
          scamType: "fake-calls",
          description: "Fake job recruitment agency"
        },
        severity: "medium",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/fake_job.png"
      },
      {
        title: "Social Media Scam - Fake Instagram Giveaway",
        description: "Fake Instagram account promised iPhone giveaway, asked for shipping fee.",
        location: "Kolkata",
        pincode: "700001",
        coordinates: { latitude: 22.5726, longitude: 88.3639 },
        scammerDetails: {
          socialMediaHandles: [{ platform: "instagram", handle: "@fakegiveaway" }],
          scamType: "social-media",
          description: "Fake giveaway scam"
        },
        severity: "low",
        status: "resolved",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/insta_scam.png"
      },
      {
        title: "Banking Scam - Fake RBI Notice",
        description: "Victim received SMS claiming RBI account freeze, asked to click link.",
        location: "Ahmedabad",
        pincode: "380001",
        coordinates: { latitude: 23.0225, longitude: 72.5714 },
        scammerDetails: {
          scamType: "banking",
          description: "Fake RBI SMS"
        },
        severity: "critical",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/rbi_scam.png"
      },
      {
        title: "Lottery Scam - Fake Prize",
        description: "Victim told they won a lottery, asked to pay processing fee.",
        location: "Lucknow",
        pincode: "226001",
        coordinates: { latitude: 26.8467, longitude: 80.9462 },
        scammerDetails: {
          scamType: "other",
          description: "Fake lottery prize claim"
        },
        severity: "medium",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/lottery.png"
      },
      {
        title: "Courier Scam - Fake Delivery Fee",
        description: "SMS claimed parcel held, asked to pay small fee via link.",
        location: "Jaipur",
        pincode: "302001",
        coordinates: { latitude: 26.9124, longitude: 75.7873 },
        scammerDetails: {
          scamType: "fake-calls",
          description: "Fake courier delivery scam"
        },
        severity: "high",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/courier.png"
      },
      // --- Add 15 more unique entries ---
      {
        title: "Loan Scam - Instant Approval",
        description: "Victim offered instant loan, asked to pay processing fee upfront.",
        location: "Nagpur",
        pincode: "440001",
        coordinates: { latitude: 21.1458, longitude: 79.0882 },
        scammerDetails: {
          scamType: "banking",
          description: "Fake loan approval scam"
        },
        severity: "medium",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/loan.png"
      },
      {
        title: "Fake Matrimonial Scam",
        description: "Scammer posed on matrimonial site, demanded money for travel.",
        location: "Patna",
        pincode: "800001",
        coordinates: { latitude: 25.5941, longitude: 85.1376 },
        scammerDetails: {
          scamType: "romance",
          description: "Fake matrimonial profile"
        },
        severity: "high",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/matrimonial.png"
      },
      {
        title: "Fake Tech Support - Antivirus Renewal",
        description: "Victim told antivirus expired, asked to pay renewal fee via link.",
        location: "Surat",
        pincode: "395003",
        coordinates: { latitude: 21.1702, longitude: 72.8311 },
        scammerDetails: {
          scamType: "tech-support",
          description: "Fake antivirus renewal scam"
        },
        severity: "low",
        status: "resolved",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/antivirus.png"
      },
      {
        title: "Crypto Pump and Dump Scam",
        description: "Telegram group promoted fake coin, price crashed after pump.",
        location: "Indore",
        pincode: "452001",
        coordinates: { latitude: 22.7196, longitude: 75.8577 },
        scammerDetails: {
          scamType: "investment",
          description: "Pump and dump crypto scam"
        },
        severity: "critical",
        status: "reported",
        reportedBy: new mongoose.Types.ObjectId(),
        image: "uploads/pumpdump.png"
    },
  {
    title: "UPI Fraud - Fake Payment Request",
    description: "Victim received a fake UPI collect request disguised as a refund.",
    location: "Mumbai",
    pincode: "400001",
    coordinates: { latitude: 18.9388, longitude: 72.8354 },
    scammerDetails: {
      name: "Unknown",
      phoneNumber: "+919876543210",
      upiId: "fraud@upi",
      scamType: "upi-fraud",
      description: "Sent fake UPI collect request",
    },
    severity: "high",
    status: "reported",
    reportedBy: new mongoose.Types.ObjectId(),
    image: "uploads/fake_upi.png"
  },
  {
    title: "Phishing Email - Bank KYC",
    description: "Email claimed to be from SBI asking to update KYC via link.",
    location: "Delhi",
    pincode: "110001",
    coordinates: { latitude: 28.6139, longitude: 77.2090 },
    scammerDetails: {
      email: "fakebank@suspicious.com",
      scamType: "phishing",
      description: "Phishing email with fake KYC link"
    },
    severity: "critical",
    status: "under review",
    reportedBy: new mongoose.Types.ObjectId(),
    image: "uploads/phishing_email.png"
  },
  {
    title: "Investment Scam - Fake Crypto Platform",
    description: "Victim lured into depositing money into a fake crypto trading app.",
    location: "Bengaluru",
    pincode: "560001",
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
    scammerDetails: {
      website: "fakecrypto.in",
      scamType: "investment",
      description: "Fake crypto trading platform"
    },
    severity: "critical",
    status: "reported",
    reportedBy: new mongoose.Types.ObjectId(),
    image: "uploads/fake_crypto.png"
  },
  // ... add 22 more entries below
];

// Generate 25 varied scams
const scamTypes = [
  "phishing", "investment", "romance", "tech-support", "fake-calls",
  "social-media", "upi-fraud", "banking", "other"
];

while (sampleScams.length < 25) {
  const type = scamTypes[Math.floor(Math.random() * scamTypes.length)];
  sampleScams.push({
    title: `${type} scam example`,
    description: `Example description for ${type} scam.`,
    location: "Nashik",
    pincode: "422004",
    coordinates: { latitude: 19.9975, longitude: 73.7898 },
    scammerDetails: {
      scamType: type,
      description: `Details about ${type} scam`
    },
    severity: "medium",
    status: "reported",
    reportedBy: new mongoose.Types.ObjectId(),
    image: "uploads/example.png"
  });
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    await Incident.deleteMany({});
    console.log("Cleared existing incidents");

    await Incident.insertMany(sampleScams);
    console.log("Inserted 25 scam incidents");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
