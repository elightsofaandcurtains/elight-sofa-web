// Script to fix user status in Firestore
// Run this in browser console when logged in as admin

// Copy and paste this in browser console (F12 -> Console)

const fixUserStatus = async () => {
  // Import Firebase
  const { getFirestore, doc, updateDoc, getDoc, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
  const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
  
  // Get current user
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error('No user logged in!');
    return;
  }
  
  console.log('Current user:', user.uid, user.email);
  
  // Get Firestore
  const db = getFirestore();
  
  // Update user document
  const userRef = doc(db, 'users', user.uid);
  
  try {
    // Check if document exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('Current user data:', userDoc.data());
      
      // Update status and role
      await updateDoc(userRef, {
        status: 'active',
        role: 'admin'
      });
      
      console.log('✅ User status updated to active and role to admin!');
    } else {
      console.log('User document does not exist, creating...');
      // You may need to create the document
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run it
fixUserStatus();
