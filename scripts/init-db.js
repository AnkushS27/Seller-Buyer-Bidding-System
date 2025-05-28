// Simple database initialization script
console.log("Database initialization script")
console.log("Run this after deployment to set up sample data")

const sampleData = {
  buyer: {
    email: "buyer@example.com",
    name: "John Buyer",
    userType: "BUYER",
  },
  seller: {
    email: "seller@example.com",
    name: "Jane Seller",
    userType: "SELLER",
  },
  project: {
    title: "Build a Modern E-commerce Website",
    description: "We need a responsive e-commerce website with payment integration...",
    budgetMin: 5000,
    budgetMax: 10000,
  },
}

console.log("Sample data structure:", JSON.stringify(sampleData, null, 2))
console.log("Use the registration form to create these test accounts")
