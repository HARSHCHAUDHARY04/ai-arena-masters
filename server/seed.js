require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ai_arena';

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('🌱 Seeding MongoDB...');

    // Create collections if they don't exist
    const collections = [
      'users', 'profiles', 'user_roles', 'teams', 'team_members',
      'events', 'rounds', 'qualifications', 'competition_levels', 'api_submissions', 'scores'
    ];

    for (const collName of collections) {
      const exists = await db.listCollections({ name: collName }).hasNext();
      if (!exists) {
        await db.createCollection(collName);
        console.log(`✓ Created collection: ${collName}`);
      }
    }

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('user_roles').createIndex({ user_id: 1 });
    await db.collection('teams').createIndex({ event_id: 1 });
    await db.collection('team_members').createIndex({ team_id: 1, user_id: 1 });
    await db.collection('scores').createIndex({ team_id: 1, event_id: 1 });
    await db.collection('rounds').createIndex({ event_id: 1, number: 1 });
    await db.collection('qualifications').createIndex({ round_id: 1, team_id: 1 });

    // Create demo admin users if they don't exist
    const demoAdmins = [
      { email: 'admin1@example.com', password: 'admin123' },
      { email: 'admin@gmail.com', password: '123456' }
    ];

    for (const a of demoAdmins) {
      const existing = await db.collection('users').findOne({ email: a.email });
      if (!existing) {
        const passwordHash = await bcrypt.hash(a.password, 10);
        const result = await db.collection('users').insertOne({
          email: a.email,
          passwordHash,
          createdAt: new Date()
        });

        // Assign admin role
        await db.collection('user_roles').insertOne({
          user_id: result.insertedId.toString(),
          role: 'admin',
          created_at: new Date()
        });

        // Create profile
        await db.collection('profiles').insertOne({
          _id: result.insertedId,
          email: a.email,
          team_name: 'Admin',
          created_at: new Date(),
          updated_at: new Date()
        });

        console.log(`✓ Created admin user: ${a.email}`);
        console.log(`  Password: ${a.password}`);
      } else {
        console.log(`✓ Admin user already exists: ${a.email}`);
      }
    }

    // Create sample event if doesn't exist
    const sampleEventName = 'Sample AI Competition';
    const existingEvent = await db.collection('events').findOne({ title: sampleEventName });

    if (!existingEvent) {
      const eventResult = await db.collection('events').insertOne({
        title: sampleEventName,
        description: 'A sample competition to get started',
        status: 'active',
        start_time: new Date(),
        end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        problem_statement: 'Build an API that processes requests and returns accurate results',
        rules: 'Follow the API contract provided. Be accurate and fast.',
        submissions_locked: false,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Create competition level
      await db.collection('competition_levels').insertOne({
        event_id: eventResult.insertedId.toString(),
        name: 'Beginner',
        description: 'Basic level',
        max_points: 100,
        order_index: 1,
        created_at: new Date()
      });

      console.log('✓ Created sample event');
    } else {
      console.log('✓ Sample event already exists');
    }

    // Create sample participant users and teams
    const participants = [
      { email: 'participant1@test.com', password: 'pass123', teamName: 'Team Alpha' },
      { email: 'participant2@test.com', password: 'pass123', teamName: 'Team Alpha' },
      { email: 'participant3@test.com', password: 'pass123', teamName: 'Team Beta' },
      { email: 'participant4@test.com', password: 'pass123', teamName: 'Team Beta' }
    ];

    const event = await db.collection('events').findOne({ title: sampleEventName });
    if (event && participants.length > 0) {
      const existingTeams = await db.collection('teams').find({ event_id: event._id.toString() }).toArray();
      
      if (existingTeams.length === 0) {
        const teamMap = {};
        
        for (const p of participants) {
          // Create or reuse user
          let user = await db.collection('users').findOne({ email: p.email });
          if (!user) {
            const passwordHash = await bcrypt.hash(p.password, 10);
            const result = await db.collection('users').insertOne({
              email: p.email,
              passwordHash,
              createdAt: new Date()
            });
            user = await db.collection('users').findOne({ _id: result.insertedId });
            
            // Create participant role
            await db.collection('user_roles').insertOne({
              user_id: result.insertedId.toString(),
              role: 'participant',
              created_at: new Date()
            });

            // Create profile
            await db.collection('profiles').insertOne({
              _id: result.insertedId,
              email: p.email,
              team_name: p.teamName,
              created_at: new Date(),
              updated_at: new Date()
            });
          }

          // Create or reuse team
          if (!teamMap[p.teamName]) {
            const teamResult = await db.collection('teams').insertOne({
              event_id: event._id.toString(),
              name: p.teamName,
              shortlist_status: 'pending',
              dataset_name: 'Sample Dataset',
              dataset_description: 'AI classification dataset with 1000 samples',
              created_at: new Date()
            });
            teamMap[p.teamName] = teamResult.insertedId.toString();
          }

          // Add user to team
          if (user) {
            await db.collection('team_members').insertOne({
              team_id: teamMap[p.teamName],
              user_id: user._id.toString(),
              role: 'member',
              joined_at: new Date()
            });
          }
        }

        console.log('✓ Created sample participant users and teams');
        console.log('\n Sample participant credentials:');
        participants.slice(0, 2).forEach(p => {
          console.log(`  Email: ${p.email} | Password: ${p.password} | Team: ${p.teamName}`);
        });
      } else {
        console.log('✓ Sample teams already exist');
      }
    }

    console.log('\n✅ Seeding complete!\n');
    console.log('Admin Credentials:');
    console.log('  Email: admin@gmail.com');
    console.log('  Password: 123456');
    console.log('\n⚠️  Remember to change admin password in production!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
