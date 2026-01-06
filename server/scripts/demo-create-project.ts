
const API_URL = 'http://localhost:3000/api';


async function main() {
  try {
    console.log('🚀 Starting Demo: Create Project via Backend API');
    console.log('------------------------------------------------');

    // 1. Authenticate (Register or Login)
    const userCredentials = {
      email: 'demo-user@example.com',
      password: 'DemoPassword123!',
      name: 'Demo User'
    };

    let token = '';

    console.log(`1. Attempting to register user: ${userCredentials.email}`);
    
    let authRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userCredentials),
    });

    let authData: any = await authRes.json();

    if (authRes.status === 400 && authData.message === 'User already exists') {
        console.log('   User already exists. Logging in...');
        authRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userCredentials.email, password: userCredentials.password }),
        });
        authData = await authRes.json();
    }

    if (!authRes.ok) {
        throw new Error(`Authentication failed: ${JSON.stringify(authData)}`);
    }

    token = authData.data.accessToken;
    console.log('✅ Authentication successful. Token acquired.');

    // 2. Create Project
    console.log('\n2. Creating a new project...');
    const newProject = {
        name: 'Frontend Integration Demo',
        description: 'This project confirms the backend API is ready for the frontend.',
        color: '#10b981', // Emerald green
        icon: 'network'
    };

    const projectRes = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProject),
    });

    const projectData = await projectRes.json();

    if (!projectRes.ok) {
        throw new Error(`Create Project failed: ${JSON.stringify(projectData)}`);
    }

    console.log('✅ Project created successfully!');
    console.log('   Response Data:');
    console.log(JSON.stringify(projectData.data.project, null, 2));

    console.log('\n------------------------------------------------');
    console.log('🎉 Backend API is functioning and ready to connect with the Frontend!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
