const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Event = require('./models/Event');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artizone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Event.deleteMany({});

    // Create sample artisans
    const artisans = [
      {
        email: 'sarah.chen@example.com',
        password: 'password123',
        role: 'artisan',
        profile: {
          firstName: 'Sarah',
          lastName: 'Chen',
          bio: 'Master potter with 15 years of experience in traditional ceramics',
          location: {
            city: 'San Francisco',
            state: 'CA',
            country: 'USA'
          },
          phone: '+1-555-0123',
          website: 'https://sarahchenpottery.com',
          socialMedia: {
            instagram: '@sarahchenpottery',
            facebook: 'SarahChenPottery'
          }
        },
        artisanProfile: {
          story: 'I fell in love with pottery during a study abroad program in Japan. The meditative process of shaping clay on the wheel became my passion, and I\'ve been creating functional art pieces ever since.',
          specialties: ['pottery', 'ceramics', 'functional art'],
          experience: 15,
          certifications: ['Master Potter Certification', 'Traditional Japanese Ceramics'],
          portfolio: [
            {
              title: 'Zen Tea Set',
              description: 'Hand-thrown tea set inspired by Japanese aesthetics',
              imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
              category: 'pottery',
              price: 180,
              isAvailable: true
            },
            {
              title: 'Modern Vase Collection',
              description: 'Contemporary vases with minimalist design',
              imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
              category: 'pottery',
              price: 120,
              isAvailable: true
            }
          ],
          pricingPreferences: {
            hourlyRate: 45,
            customPricing: true,
            bulkDiscounts: true
          },
          availability: {
            isAvailable: true,
            workingHours: '9 AM - 6 PM PST',
            timezone: 'PST'
          },
          ratings: {
            average: 4.8,
            count: 127
          }
        }
      },
      {
        email: 'marcus.rodriguez@example.com',
        password: 'password123',
        role: 'artisan',
        profile: {
          firstName: 'Marcus',
          lastName: 'Rodriguez',
          bio: 'Contemporary jewelry designer specializing in sustainable materials',
          location: {
            city: 'Austin',
            state: 'TX',
            country: 'USA'
          },
          phone: '+1-555-0456',
          website: 'https://marcusrodriguezjewelry.com'
        },
        artisanProfile: {
          story: 'My journey began with a fascination for the stories that jewelry can tell. I create pieces that celebrate both modern design and traditional craftsmanship.',
          specialties: ['jewelry', 'metalwork', 'sustainable design'],
          experience: 8,
          certifications: ['GIA Graduate Gemologist', 'Sustainable Design Certificate'],
          portfolio: [
            {
              title: 'Ocean Wave Ring',
              description: 'Sterling silver ring inspired by ocean waves',
              imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
              category: 'jewelry',
              price: 95,
              isAvailable: true
            },
            {
              title: 'Geometric Necklace',
              description: 'Modern geometric pendant in recycled silver',
              imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
              category: 'jewelry',
              price: 150,
              isAvailable: true
            }
          ],
          pricingPreferences: {
            hourlyRate: 60,
            customPricing: true,
            bulkDiscounts: false
          },
          availability: {
            isAvailable: true,
            workingHours: '10 AM - 7 PM CST',
            timezone: 'CST'
          },
          ratings: {
            average: 4.9,
            count: 89
          }
        }
      },
      {
        email: 'emily.johnson@example.com',
        password: 'password123',
        role: 'artisan',
        profile: {
          firstName: 'Emily',
          lastName: 'Johnson',
          bio: 'Textile artist creating handwoven scarves and home decor',
          location: {
            city: 'Portland',
            state: 'OR',
            country: 'USA'
          },
          phone: '+1-555-0789'
        },
        artisanProfile: {
          story: 'I learned traditional weaving techniques from my grandmother and have adapted them to create contemporary pieces that honor the past while embracing the future.',
          specialties: ['textiles', 'weaving', 'home decor'],
          experience: 12,
          certifications: ['Traditional Weaving Master', 'Sustainable Textiles'],
          portfolio: [
            {
              title: 'Handwoven Scarf',
              description: 'Silk and wool blend scarf with intricate patterns',
              imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
              category: 'textiles',
              price: 85,
              isAvailable: true
            },
            {
              title: 'Wall Hanging',
              description: 'Decorative wall hanging with natural fibers',
              imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
              category: 'textiles',
              price: 120,
              isAvailable: true
            }
          ],
          pricingPreferences: {
            hourlyRate: 35,
            customPricing: true,
            bulkDiscounts: true
          },
          availability: {
            isAvailable: true,
            workingHours: '8 AM - 5 PM PST',
            timezone: 'PST'
          },
          ratings: {
            average: 4.7,
            count: 156
          }
        }
      }
    ];

    // Create sample vendors
    const vendors = [
      {
        email: 'retail@craftgallery.com',
        password: 'password123',
        role: 'vendor',
        profile: {
          firstName: 'David',
          lastName: 'Kim',
          bio: 'Owner of Craft Gallery, specializing in handmade home decor',
          location: {
            city: 'Seattle',
            state: 'WA',
            country: 'USA'
          },
          phone: '+1-555-0321',
          website: 'https://craftgallery.com'
        },
        vendorProfile: {
          businessName: 'Craft Gallery',
          businessType: 'retailer',
          taxId: 'TAX123456789',
          businessLicense: 'BL987654321',
          preferredArtisanTypes: ['pottery', 'textiles', 'woodwork'],
          bulkOrderPreferences: {
            minOrderValue: 500,
            preferredCategories: ['home decor', 'functional art'],
            contractTerms: 'Net 30 payment terms'
          },
          vendorRating: {
            average: 4.6,
            count: 45
          }
        }
      },
      {
        email: 'wholesale@modernliving.com',
        password: 'password123',
        role: 'vendor',
        profile: {
          firstName: 'Lisa',
          lastName: 'Wang',
          bio: 'Wholesale buyer for Modern Living retail chain',
          location: {
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA'
          },
          phone: '+1-555-0654'
        },
        vendorProfile: {
          businessName: 'Modern Living',
          businessType: 'wholesaler',
          taxId: 'TAX987654321',
          businessLicense: 'BL123456789',
          preferredArtisanTypes: ['jewelry', 'accessories', 'textiles'],
          bulkOrderPreferences: {
            minOrderValue: 1000,
            preferredCategories: ['jewelry', 'accessories'],
            contractTerms: 'Net 45 payment terms'
          },
          vendorRating: {
            average: 4.8,
            count: 78
          }
        }
      }
    ];

    // Create sample customers
    const customers = [
      {
        email: 'customer1@example.com',
        password: 'password123',
        role: 'customer',
        profile: {
          firstName: 'Jennifer',
          lastName: 'Smith',
          bio: 'Art lover and collector of handmade pieces',
          location: {
            city: 'New York',
            state: 'NY',
            country: 'USA'
          }
        },
        customerProfile: {
          preferences: {
            favoriteCategories: ['pottery', 'jewelry', 'textiles'],
            priceRange: {
              min: 50,
              max: 500
            },
            preferredArtisans: []
          },
          wishlist: [],
          orderHistory: []
        }
      },
      {
        email: 'customer2@example.com',
        password: 'password123',
        role: 'customer',
        profile: {
          firstName: 'Michael',
          lastName: 'Brown',
          bio: 'Interior designer seeking unique pieces for clients',
          location: {
            city: 'Chicago',
            state: 'IL',
            country: 'USA'
          }
        },
        customerProfile: {
          preferences: {
            favoriteCategories: ['home decor', 'sculpture', 'woodwork'],
            priceRange: {
              min: 100,
              max: 1000
            },
            preferredArtisans: []
          },
          wishlist: [],
          orderHistory: []
        }
      }
    ];

    // Create all users
    const allUsers = [...artisans, ...vendors, ...customers];
    const createdUsers = await User.insertMany(allUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create sample products
    const products = [
      {
        artisan: createdUsers[0]._id, // Sarah Chen
        title: 'Hand-Thrown Ceramic Bowl Set',
        description: 'A beautiful set of three hand-thrown ceramic bowls, each with unique glazing patterns. Perfect for everyday use or special occasions.',
        category: 'pottery',
        subcategory: 'functional',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
            alt: 'Ceramic bowl set',
            isPrimary: true
          }
        ],
        price: 85,
        materials: ['stoneware clay', 'food-safe glaze'],
        techniques: ['wheel throwing', 'hand glazing'],
        colors: ['cream', 'sage green', 'terracotta'],
        tags: ['functional', 'handmade', 'ceramic', 'bowl'],
        availability: {
          inStock: true,
          quantity: 5,
          isCustomizable: true,
          customOptions: [
            {
              name: 'Glaze Color',
              type: 'color',
              options: ['cream', 'sage green', 'terracotta', 'navy'],
              priceModifier: 0
            }
          ]
        },
        shipping: {
          shippingCost: 15,
          freeShippingThreshold: 100,
          estimatedDelivery: '5-7 business days',
          shippingRestrictions: []
        },
        ratings: {
          average: 4.8,
          count: 23,
          breakdown: {
            five: 18,
            four: 4,
            three: 1,
            two: 0,
            one: 0
          }
        },
        views: 156,
        favorites: [],
        isFeatured: true,
        isActive: true
      },
      {
        artisan: createdUsers[1]._id, // Marcus Rodriguez
        title: 'Sterling Silver Wave Ring',
        description: 'Elegant sterling silver ring featuring a flowing wave design. Handcrafted with attention to detail and comfort.',
        category: 'jewelry',
        subcategory: 'rings',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
            alt: 'Silver wave ring',
            isPrimary: true
          }
        ],
        price: 125,
        materials: ['sterling silver'],
        techniques: ['hand forging', 'polishing'],
        colors: ['silver'],
        tags: ['jewelry', 'ring', 'silver', 'wave', 'handmade'],
        availability: {
          inStock: true,
          quantity: 3,
          isCustomizable: true,
          customOptions: [
            {
              name: 'Ring Size',
              type: 'size',
              options: ['6', '7', '8', '9', '10'],
              priceModifier: 0
            }
          ]
        },
        shipping: {
          shippingCost: 8,
          freeShippingThreshold: 150,
          estimatedDelivery: '3-5 business days',
          shippingRestrictions: []
        },
        ratings: {
          average: 4.9,
          count: 31,
          breakdown: {
            five: 28,
            four: 3,
            three: 0,
            two: 0,
            one: 0
          }
        },
        views: 203,
        favorites: [],
        isFeatured: true,
        isActive: true
      },
      {
        artisan: createdUsers[2]._id, // Emily Johnson
        title: 'Handwoven Silk Scarf',
        description: 'Luxurious handwoven scarf made from pure silk and merino wool blend. Features intricate geometric patterns.',
        category: 'textiles',
        subcategory: 'accessories',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
            alt: 'Handwoven silk scarf',
            isPrimary: true
          }
        ],
        price: 95,
        materials: ['silk', 'merino wool'],
        techniques: ['hand weaving', 'hand dyeing'],
        colors: ['ivory', 'gold', 'sage'],
        tags: ['scarf', 'silk', 'handwoven', 'luxury', 'accessories'],
        availability: {
          inStock: true,
          quantity: 7,
          isCustomizable: false,
          customOptions: []
        },
        shipping: {
          shippingCost: 12,
          freeShippingThreshold: 100,
          estimatedDelivery: '4-6 business days',
          shippingRestrictions: []
        },
        ratings: {
          average: 4.7,
          count: 19,
          breakdown: {
            five: 14,
            four: 4,
            three: 1,
            two: 0,
            one: 0
          }
        },
        views: 134,
        favorites: [],
        isFeatured: false,
        isActive: true
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create sample events
    const events = [
      {
        title: 'Spring Artisan Market',
        description: 'Join us for our annual spring market featuring local artisans, live demonstrations, and unique handmade goods.',
        type: 'market',
        organizer: createdUsers[0]._id, // Sarah Chen
        location: {
          type: 'physical',
          address: {
            street: '123 Artisan Way',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'USA'
          },
          coordinates: {
            lat: 37.7749,
            lng: -122.4194
          }
        },
        schedule: {
          startDate: new Date('2024-04-15T10:00:00Z'),
          endDate: new Date('2024-04-15T18:00:00Z'),
          timezone: 'PST'
        },
        capacity: {
          maxAttendees: 200,
          currentAttendees: 0,
          isWaitlist: false
        },
        pricing: {
          isFree: true,
          currency: 'USD'
        },
        categories: ['pottery', 'jewelry', 'textiles', 'woodwork'],
        tags: ['market', 'spring', 'local', 'artisan'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
            alt: 'Spring artisan market',
            isPrimary: true
          }
        ],
        requirements: {
          skillLevel: 'all',
          materials: [],
          tools: [],
          prerequisites: []
        },
        attendees: [],
        featuredArtisans: [createdUsers[0]._id, createdUsers[1]._id],
        sponsors: [],
        status: 'published',
        isFeatured: true
      },
      {
        title: 'Pottery Wheel Workshop',
        description: 'Learn the basics of wheel throwing in this hands-on workshop led by master potter Sarah Chen.',
        type: 'workshop',
        organizer: createdUsers[0]._id, // Sarah Chen
        location: {
          type: 'physical',
          address: {
            street: '456 Clay Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94103',
            country: 'USA'
          }
        },
        schedule: {
          startDate: new Date('2024-04-20T14:00:00Z'),
          endDate: new Date('2024-04-20T17:00:00Z'),
          timezone: 'PST'
        },
        capacity: {
          maxAttendees: 12,
          currentAttendees: 0,
          isWaitlist: false
        },
        pricing: {
          isFree: false,
          price: 75,
          currency: 'USD'
        },
        categories: ['pottery'],
        tags: ['workshop', 'pottery', 'wheel throwing', 'beginner'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
            alt: 'Pottery wheel workshop',
            isPrimary: true
          }
        ],
        requirements: {
          skillLevel: 'beginner',
          materials: ['clay', 'tools'],
          tools: ['pottery wheel', 'ribs', 'wire tool'],
          prerequisites: ['No experience required']
        },
        attendees: [],
        featuredArtisans: [createdUsers[0]._id],
        sponsors: [],
        status: 'published',
        isFeatured: false
      }
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} events`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Events: ${createdEvents.length}`);
    console.log('\n🔑 Test Accounts:');
    console.log('Artisan: sarah.chen@example.com / password123');
    console.log('Vendor: retail@craftgallery.com / password123');
    console.log('Customer: customer1@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
