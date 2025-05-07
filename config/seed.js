// seed.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function seed() {

 // Step 1: Create or retrieve a user (buyer)
 let buyer = await prisma.user.findUnique({
  where: { id: 'user-uuid-123' },
});
if (!buyer) {
  buyer = await prisma.user.create({
    data: {
      id: 'user-uuid-123',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword123', // In a real app, hash this password
      role: 'buyer',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log('Created buyer:', buyer);
} else {
  console.log('Buyer already exists:', buyer);
}

// Step 2: Create or retrieve an admin user
let admin = await prisma.user.findUnique({
  where: { id: 'admin-uuid-456' },
});
if (!admin) {
  admin = await prisma.user.create({
    data: {
      id: 'admin-uuid-456',
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashedpassword456', // In a real app, hash this password
      role: 'admin',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log('Created admin:', admin);
} else {
  console.log('Admin already exists:', admin);
}

// Step 3: Create or retrieve a commenter user (for comments)
let commenter = await prisma.user.findUnique({
  where: { id: 'commenter-uuid-789' },
});
if (!commenter) {
  commenter = await prisma.user.create({
    data: {
      id: 'commenter-uuid-789',
      full_name: 'Lila Grace',
      email: 'lila.grace@example.com',
      password: 'hashedpassword789', // In a real app, hash this password
      role: 'buyer',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log('Created commenter:', commenter);
} else {
  console.log('Commenter already exists:', commenter);
}

// Step 3.1: Create users for conversations (Sia D, Tokyo, Emily, Molly, Jane, Monika, Otos)
const conversationUsersData = [
  { id: 'user-sia-uuid', full_name: 'Sia D', email: 'sia.d@example.com' },
  { id: 'user-tokyo-uuid', full_name: 'Tokyo', email: 'tokyo@example.com' },
  { id: 'user-emily-uuid', full_name: 'Emily', email: 'emily@example.com' },
  { id: 'user-molly-uuid', full_name: 'Molly', email: 'molly@example.com' },
  { id: 'user-jane-uuid', full_name: 'Jane', email: 'jane@example.com' },
  { id: 'user-monika-uuid', full_name: 'Monika', email: 'monika@example.com' },
  { id: 'user-otos-uuid', full_name: 'Otos', email: 'otos@example.com' },
];

const conversationUsers = [];
for (const userData of conversationUsersData) {
  let user = await prisma.user.findUnique({
    where: { id: userData.id },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
        password: 'hashedpassword', // In a real app, hash this password
        role: 'buyer',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`Created user ${user.full_name}:`, user);
  } else {
    console.log(`User ${user.full_name} already exists:`, user);
  }
  conversationUsers.push(user);
}

// Step 3.2: Create additional users for posts (to support 234 posts)
const existingUsersCount = await prisma.user.count();
const usersToCreate = 234 - existingUsersCount + conversationUsers.length; // Adjust for new users
const additionalUsers = [];
if (usersToCreate > 0) {
  for (let i = 0; i < usersToCreate; i++) {
    const userId = `user-uuid-${1000 + i}`;
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          id: userId,
          full_name: `User ${1000 + i}`,
          email: `user${1000 + i}@example.com`,
          password: 'hashedpassword', // In a real app, hash this password
          role: 'buyer',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      additionalUsers.push(user);
    }
  }
  console.log(`Created ${additionalUsers.length} additional users for posts`);
}

// Fetch all users to assign posts
const allUsers = await prisma.user.findMany();
if (allUsers.length < 234) {
  throw new Error(`Not enough users to create 234 posts. Found ${allUsers.length} users.`);
}

// Step 4: Create a product (Dog clothes)
const product = await prisma.product.create({
  data: {
    name: 'Dog clothes name',
    imageUrl: '/uploads/dog-clothes.png',
    price: 200,
    rating: 4.5,
    description: 'Short description should be written here about services short description should be written here',
    createdAt: new Date(),
  },
});
console.log('Created product:', product);

// // Step 5: Create multiple orders for the user and product
// const orders = await Promise.all(
//   Array.from({ length: 5 }, (_, index) => {
//     const orderNumber = (46578295 + index).toString(); // Ensure unique order numbers
//     return prisma.order.create({
//       data: {
//         userId: buyer.id,
//         productId: product.id,
//         quantity: 1,
//         totalPrice: 200,
//         orderNumber: orderNumber,
//         deliveryMethod: 'CARD',
//         deliveryAddress: {
//           name: 'Jonathan Doe',
//           street: '144 Baker Avenue',
//           city: 'Northenhills, UK',
//           postalCode: 'SW43 4MM',
//         },
//         estimatedArrival: new Date('2023-04-05'), // Mon, Apr 5th
//         billingDetails: {
//           sameAsDelivery: true, // "Same as delivery address"
//         },
//         paymentMethod: 'Debit card ending in 1234',
//         status: 'PENDING',
//         createdAt: new Date('2023-04-03'), // Apr 3, 2023
//       },
//     });
//   })
// );
// console.log('Created orders:', orders);

// Step 6: Create advertisements with different types, including Announcement
const advertisements = await Promise.all([
  prisma.advertisement.create({
    data: {
      title: 'Dog Clothes Sale',
      imageUrl: '/uploads/dog-clothes-ad.png',
      redirectTo: '/storefront/dog-clothes',
      redirectType: 'Storefront',
      slogan: 'Get 20% Off Dog Clothes!',
      description: 'Limited time offer on dog apparel.',
      isActive: true,
      advertisementType: 'Apparel',
      template_index: 0,
      createdAt: new Date(),
    },
  }),
  prisma.advertisement.create({
    data: {
      title: 'Puppies Ready for Adoption',
      imageUrl: '/uploads/puppies-adoption.png',
      redirectTo: '/adoptions',
      redirectType: 'OtherLink',
      slogan: 'Puppies Ready for Adoption',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing...',
      isActive: true,
      advertisementType: 'Announcement',
      template_index: 1,
      createdAt: new Date(),
    },
  }),
]);
console.log('Created advertisements:', advertisements);

// Step 7: Create 234 posts for the Announcement advertisement
const announcementAdId = advertisements[1].id;
const existingPostsCount = await prisma.post.count({
  where: { advertisementId: announcementAdId },
});
const postsToCreate = 234 - existingPostsCount;
let posts = [];
if (postsToCreate > 0) {
  posts = await Promise.all(
    allUsers.slice(0, postsToCreate).map(user =>
      prisma.post.create({
        data: {
          userId: user.id,
          advertisementId: announcementAdId,
          content: `Shared by ${user.full_name}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );
  console.log('Created posts:', posts.length);
} else {
  console.log('Posts already exist, skipping creation');
  posts = await prisma.post.findMany({
    where: { advertisementId: announcementAdId },
  });
}

// Step 8: Add likes to the first post (e.g., 50 likes)
const firstPost = posts[0];
const existingLikesCount = await prisma.like.count({
  where: { postId: firstPost.id },
});
const likesToCreate = 50 - existingLikesCount;
if (likesToCreate > 0) {
  const likes = await Promise.all(
    allUsers.slice(0, likesToCreate).map(user =>
      prisma.like.upsert({
        where: {
          userId_postId: {
            userId: user.id,
            postId: firstPost.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          postId: firstPost.id,
          createdAt: new Date(),
        },
      })
    )
  );
  console.log('Created/updated likes:', likes.length);
} else {
  console.log('Likes already exist, skipping creation');
}

// Step 9: Add comments to the first post
const existingComments = await prisma.comment.findMany({
  where: { postId: firstPost.id },
});
if (existingComments.length < 3) {
  const commentsToCreate = 3 - existingComments.length;
  const comments = await Promise.all(
    Array.from({ length: commentsToCreate }, () => {
      return prisma.comment.create({
        data: {
          userId: commenter.id,
          postId: firstPost.id,
          content: 'A personal touch for every pet—creating unique experiences, from portraits to personalized treats.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 days ago
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });
    })
  );
  console.log('Created comments:', comments);
} else {
  console.log('Comments already exist, skipping creation');
}

// Step 10: Create messages for conversations
const messagesData = [
  // Sia D: 12 unread messages
  { senderId: 'user-sia-uuid', receiverId: buyer.id, content: 'Hey, how are you?', isRead: false, createdAt: new Date('2025-04-25T11:25:00.000Z') },
  { senderId: buyer.id, receiverId: 'user-sia-uuid', content: 'Hi Sia, I’m good!', isRead: true, createdAt: new Date('2025-04-25T12:29:00.000Z') },
  { senderId: 'user-sia-uuid', receiverId: buyer.id, content: 'Enter your message description here...', isRead: false, createdAt: new Date('2025-04-25T01:25:00.000Z') },

  // Tokyo: 0 unread messages
  { senderId: 'user-tokyo-uuid', receiverId: buyer.id, content: 'Hi John!', isRead: true, createdAt: new Date('2025-04-25T11:25:00.000Z') },
  { senderId: buyer.id, receiverId: 'user-tokyo-uuid', content: 'Enter your message description here...', isRead: true, createdAt: new Date('2025-04-25T12:29:00.000Z') },

  // Emily: 9 unread messages
  { senderId: 'user-emily-uuid', receiverId: buyer.id, content: 'Hey there!', isRead: false, createdAt: new Date('2025-04-25T11:25:00.000Z') },
  { senderId: buyer.id, receiverId: 'user-emily-uuid', content: 'Hi Emily!', isRead: true, createdAt: new Date('2025-04-25T12:29:00.000Z') },
  { senderId: 'user-emily-uuid', receiverId: buyer.id, content: 'Enter your message description here...', isRead: false, createdAt: new Date('2025-04-25T01:25:00.000Z') },

  // Molly: 0 unread messages
  { senderId: 'user-molly-uuid', receiverId: buyer.id, content: 'Hello!', isRead: true, createdAt: new Date('2025-04-25T11:25:00.000Z') },
  { senderId: buyer.id, receiverId: 'user-molly-uuid', content: 'Enter your message description here...', isRead: true, createdAt: new Date('2025-04-25T12:29:00.000Z') },

  // Jane: Messages as shown in the image
  { senderId: 'user-jane-uuid', receiverId: buyer.id, content: 'Hey man!', isRead: true, createdAt: new Date('2025-04-25T11:25:00.000Z') },
  { senderId: buyer.id, receiverId: 'user-jane-uuid', content: "Hey, what's up? How are you doing, my friends? It's been a while xD", isRead: true, createdAt: new Date('2025-04-25T12:29:00.000Z') },
  { senderId: 'user-jane-uuid', receiverId: buyer.id, content: 'Have you seen the latest holographic display technology?', isRead: true, createdAt: new Date('2025-04-25T01:25:00.000Z') },
  { senderId: buyer.id, receiverId: 'user-jane-uuid', content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', isRead: true, createdAt: new Date('2025-04-25T03:25:00.000Z') },

  // Monika: 2 unread messages
  { senderId: 'user-monika-uuid', receiverId: buyer.id, content: 'Hey!', isRead: false, createdAt: new Date('2025-04-25T11:25:00.000Z') },
  { senderId: buyer.id, receiverId: 'user-monika-uuid', content: 'Enter your message description here...', isRead: true, createdAt: new Date('2025-04-25T12:29:00.000Z') },

  // Otos: 0 unread messages
  { senderId: 'user-otos-uuid', receiverId: buyer.id, content: 'Hi!', isRead: true, createdAt: new Date('2025-04-25T11:25:00.000Z') },
  { senderId: buyer.id, receiverId: 'user-otos-uuid', content: 'Enter your message description here...', isRead: true, createdAt: new Date('2025-04-25T12:29:00.000Z') },
];

for (const msg of messagesData) {
  await prisma.message.create({
    data: {
      id: `msg-uuid-${Math.random().toString(36).substr(2, 9)}`, // Generate a random UUID
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    },
  });
}
console.log('Created messages for conversations');

// Step 11: Create a meeting between buyer and Jane
const meeting = await prisma.meeting.create({
  data: {
    userId: buyer.id,
    invitedId: 'user-jane-uuid', // Add invitedId
    productId: product.id,
    dateTime: new Date('2024-02-23T12:30:00.000Z'),
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});
console.log('Created meeting between buyer and Jane:', meeting);

  console.log('Dummy data inserted');
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());