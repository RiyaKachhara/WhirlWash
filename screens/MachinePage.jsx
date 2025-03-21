// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   ActivityIndicator,
// //   Alert,
// //   TouchableOpacity,
// //   Image,
// // } from 'react-native';
// // import firestore from '@react-native-firebase/firestore';
// // import auth from '@react-native-firebase/auth';

// // const MachinePage = () => {
// //   const [availableMachines, setAvailableMachines] = useState([]);
// //   const [bookedMachines, setBookedMachines] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const currentUser = auth().currentUser;

// //   useEffect(() => {
// //     // Set up real-time listener for machine collection
// //     const unsubscribe = firestore()
// //       .collection('machines')
// //       .onSnapshot(
// //         snapshot => {
// //           const available = [];
// //           const booked = [];

// //           snapshot.forEach(doc => {
// //             const data = doc.data();
// //             if (data.inUse === false && data.underMaintenance !== true) {
// //               available.push({ id: doc.id, ...data });
// //             } else if (data.inUse === true) {
// //               booked.push({ id: doc.id, ...data });
// //             }
// //           });

// //           setAvailableMachines(available);
// //           setBookedMachines(booked);
// //           setLoading(false);
// //         },
// //         error => {
// //           console.error('Error listening to machines collection:', error);
// //           Alert.alert('Error', 'Failed to load machine data.');
// //           setLoading(false);
// //         }
// //       );

// //     // Clean up the listener when component unmounts
// //     return () => unsubscribe();
// //   }, []);

// //   const handleBookMachine = async (machine) => {
// //     try {
// //       if (!currentUser) {
// //         Alert.alert('Error', 'You must be logged in to book a machine.');
// //         return;
// //       }

// //       if (machine.inUse) {
// //         return; // Do nothing if the machine is already booked
// //       }

// //       const machineRef = firestore().collection('machines').doc(machine.id);
// //       await machineRef.update({ 
// //         inUse: true, 
// //         bookedBy: currentUser.email,
// //         bookingTime: firestore.FieldValue.serverTimestamp(),
// //         status: 'in-use'
// //       });

// //       // No need for manual state updates since we have the real-time listener
// //       Alert.alert(`Success! Machine No. ${machine.number} booked!`);
// //     } catch (error) {
// //       console.error('Error booking machine:', error);
// //       Alert.alert('Error', 'Failed to book machine.');
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container}>
// //       <Text style={styles.heading}>LNMIIT, Jaipur</Text>
// //       <Text style={styles.subheading}>
// //         {availableMachines.length} machines available
// //       </Text>

// //       {loading ? (
// //         <View style={styles.loaderContainer}>
// //           <ActivityIndicator size="large" color="#3D4EB0" />
// //         </View>
// //       ) : (
// //         <>
// //           <Text style={styles.sectionTitle}>Available washing machines</Text>
// //           <View style={styles.grid}>
// //             {availableMachines.length > 0 ? (
// //               availableMachines.map(machine => (
// //                 <MachineCard
// //                   key={machine.id}
// //                   machine={machine}
// //                   onPress={() => handleBookMachine(machine)}
// //                 />
// //               ))
// //             ) : (
// //               <Text style={styles.noMachinesText}>No available machines</Text>
// //             )}
// //           </View>

// //           <Text style={styles.sectionTitle}>Booked washing machines</Text>
// //           <View style={styles.grid}>
// //             {bookedMachines.length > 0 ? (
// //               bookedMachines.map(machine => (
// //                 <MachineCard key={machine.id} machine={machine} booked />
// //               ))
// //             ) : (
// //               <Text style={styles.noMachinesText}>No booked machines</Text>
// //             )}
// //           </View>
// //         </>
// //       )}
// //     </ScrollView>
// //   );
// // };

// // const MachineCard = ({ machine, onPress, booked }) => {
// //   return (
// //     <TouchableOpacity
// //       style={[styles.machineCard, booked && styles.bookedMachine]}
// //       onPress={onPress}
// //       disabled={booked} // Disables press if already booked
// //     >
// //       <Image
// //         source={require('../assets/image.png')}
// //         style={styles.machineIcon}
// //       />
// //       <Text style={styles.machineText}>No. {machine.number}</Text>
// //     </TouchableOpacity>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
// //   heading: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //     marginBottom: 5,
// //   },
// //   subheading: {
// //     fontSize: 14,
// //     color: 'green',
// //     textAlign: 'center',
// //     marginBottom: 20,
// //   },
// //   loaderContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 20,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     marginBottom: 10,
// //   },
// //   grid: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     justifyContent: 'space-between',
// //   },
// //   machineCard: {
// //     width: '45%',
// //     backgroundColor: 'white',
// //     padding: 20,
// //     borderRadius: 10,
// //     alignItems: 'center',
// //     marginBottom: 15,
// //     elevation: 3,
// //   },
// //   bookedMachine: {
// //     backgroundColor: '#ccc', // Greyed out for booked machines
// //   },
// //   machineIcon: {
// //     width: 40,
// //     height: 40,
// //     marginBottom: 10,
// //   },
// //   machineText: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //   },
// //   noMachinesText: {
// //     textAlign: 'center',
// //     fontSize: 16,
// //     color: '#999',
// //     marginVertical: 10,
// //   },
// // });

// // export default MachinePage;


// //working

// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   ActivityIndicator,
// //   Alert,
// //   TouchableOpacity,
// //   Image,
// // } from 'react-native';
// // import firestore from '@react-native-firebase/firestore';
// // import auth from '@react-native-firebase/auth';

// // const MachinePage = () => {
// //   const [availableMachines, setAvailableMachines] = useState([]);
// //   const [bookedMachines, setBookedMachines] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [userHasBooking, setUserHasBooking] = useState(false);
// //   const currentUser = auth().currentUser;

// //   useEffect(() => {
// //     // Set up real-time listener for machine collection
// //     const unsubscribe = firestore()
// //       .collection('machines')
// //       .onSnapshot(
// //         snapshot => {
// //           const available = [];
// //           const booked = [];
// //           let hasBooking = false;

// //           snapshot.forEach(doc => {
// //             const data = doc.data();
// //             if (data.inUse === false && data.underMaintenance !== true) {
// //               available.push({ id: doc.id, ...data });
// //             } else if (data.inUse === true) {
// //               // Check if current user has a booking
// //               if (data.bookedBy === currentUser?.email) {
// //                 hasBooking = true;
// //               }
// //               booked.push({ id: doc.id, ...data });
// //             }
// //           });

// //           setAvailableMachines(available);
// //           setBookedMachines(booked);
// //           setUserHasBooking(hasBooking);
// //           setLoading(false);
// //         },
// //         error => {
// //           console.error('Error listening to machines collection:', error);
// //           Alert.alert('Error', 'Failed to load machine data.');
// //           setLoading(false);
// //         }
// //       );

// //     // Clean up the listener when component unmounts
// //     return () => unsubscribe();
// //   }, [currentUser]);

// //   const handleBookMachine = async (machine) => {
// //     try {
// //       if (!currentUser) {
// //         Alert.alert('Error', 'You must be logged in to book a machine.');
// //         return;
// //       }

// //       if (machine.inUse) {
// //         return; // Do nothing if the machine is already booked
// //       }

// //       // Check if user already has a booking
// //       if (userHasBooking) {
// //         Alert.alert('Error', 'You can only book one machine at a time.');
// //         return;
// //       }

// //       // Fetch user details from students collection
// //       const userQuery = await firestore()
// //         .collection('students')
// //         .where('Email', '==', currentUser.email)
// //         .limit(1)
// //         .get();

// //       let userDetails = {};
// //       if (!userQuery.empty) {
// //         userDetails = userQuery.docs[0].data();
// //       }

// //       // Calculate expiry time (15 seconds from now)
// //       const expiryTime = new Date();
// //       expiryTime.setSeconds(expiryTime.getSeconds() + 15);

// //       const machineRef = firestore().collection('machines').doc(machine.id);
// //       await machineRef.update({ 
// //         inUse: true, 
// //         bookedBy: currentUser.email,
// //         bookingTime: firestore.FieldValue.serverTimestamp(),
// //         status: 'in-use',
// //         expiryTime: expiryTime.toISOString(),
// //         userName: userDetails.name || '',
// //         userMobile: userDetails.MobileNo || ''
// //       });

// //       // Set a timer to auto-unbook the machine
// //       setTimeout(() => {
// //         autoUnbookMachine(machine.id, currentUser.email);
// //       }, 15000); // 15 seconds

// //       Alert.alert(`Success! Machine No. ${machine.number} booked!`);
// //     } catch (error) {
// //       console.error('Error booking machine:', error);
// //       Alert.alert('Error', 'Failed to book machine.');
// //     }
// //   };

// //   const autoUnbookMachine = async (machineId, userEmail) => {
// //     try {
// //       // Check if the machine is still booked by this user
// //       const machineDoc = await firestore().collection('machines').doc(machineId).get();
// //       const machineData = machineDoc.data();
      
// //       if (!machineData || machineData.bookedBy !== userEmail) {
// //         return; // Machine is already unbooked or booked by someone else
// //       }

// //       // Get user details
// //       const userQuerySnapshot = await firestore()
// //         .collection('students')
// //         .where('Email', '==', userEmail)
// //         .limit(1)
// //         .get();

// //       if (!userQuerySnapshot.empty) {
// //         const userDoc = userQuerySnapshot.docs[0].ref;
// //         const userData = userQuerySnapshot.docs[0].data();

// //         let updatedLastUses = userData.lastUses || ["", "", "", "", ""];
// //         const newEntry = new Date().toISOString();

// //         // Shift array and add new entry
// //         updatedLastUses.shift();
// //         updatedLastUses.push(newEntry);

// //         // Update user's lastUses
// //         await userDoc.update({
// //           lastUses: updatedLastUses,
// //         });
// //       }

// //       // Update machine status but keep user info for display
// //       await firestore().collection('machines').doc(machineId).update({
// //         inUse: false,
// //         bookedBy: null,
// //         status: 'available',
// //         lastUsedBy: userEmail,
// //         lastUserName: machineData.userName,
// //         lastUserMobile: machineData.userMobile,
// //         lastUsedTime: new Date().toISOString()
// //       });

// //       console.log(`Machine ${machineId} auto-unbooked due to timeout`);
// //     } catch (error) {
// //       console.error('Error auto-unbooking machine:', error);
// //     }
// //   };

// //   // Calculate time remaining for a machine
// //   const getTimeRemaining = (expiryTimeStr) => {
// //     if (!expiryTimeStr) return 0;
    
// //     const expiryTime = new Date(expiryTimeStr);
// //     const now = new Date();
// //     const diffMs = expiryTime - now;
    
// //     return Math.max(0, Math.floor(diffMs / 1000)); // Return seconds remaining
// //   };

// //   return (
// //     <ScrollView style={styles.container}>
// //       <Text style={styles.heading}>LNMIIT, Jaipur</Text>
// //       <Text style={styles.subheading}>
// //         {availableMachines.length} machines available
// //       </Text>

// //       {loading ? (
// //         <View style={styles.loaderContainer}>
// //           <ActivityIndicator size="large" color="#3D4EB0" />
// //         </View>
// //       ) : (
// //         <>
// //           <Text style={styles.sectionTitle}>Available washing machines</Text>
// //           <View style={styles.grid}>
// //             {availableMachines.length > 0 ? (
// //               availableMachines.map(machine => (
// //                 <MachineCard
// //                   key={machine.id}
// //                   machine={machine}
// //                   onPress={() => handleBookMachine(machine)}
// //                 />
// //               ))
// //             ) : (
// //               <Text style={styles.noMachinesText}>No available machines</Text>
// //             )}
// //           </View>

// //           <Text style={styles.sectionTitle}>Booked washing machines</Text>
// //           <View style={styles.grid}>
// //             {bookedMachines.length > 0 ? (
// //               bookedMachines.map(machine => (
// //                 <MachineCard 
// //                   key={machine.id} 
// //                   machine={machine} 
// //                   booked 
// //                   getTimeRemaining={getTimeRemaining}
// //                 />
// //               ))
// //             ) : (
// //               <Text style={styles.noMachinesText}>No booked machines</Text>
// //             )}
// //           </View>
// //         </>
// //       )}
// //     </ScrollView>
// //   );
// // };

// // const MachineCard = ({ machine, onPress, booked, getTimeRemaining }) => {
// //   const [timeRemaining, setTimeRemaining] = useState(0);
  
// //   useEffect(() => {
// //     let timer;
// //     if (booked && machine.expiryTime) {
// //       // Set initial time
// //       setTimeRemaining(getTimeRemaining(machine.expiryTime));
      
// //       // Update timer every second
// //       timer = setInterval(() => {
// //         const remaining = getTimeRemaining(machine.expiryTime);
// //         setTimeRemaining(remaining);
// //         if (remaining <= 0) {
// //           clearInterval(timer);
// //         }
// //       }, 1000);
// //     }
    
// //     return () => {
// //       if (timer) clearInterval(timer);
// //     };
// //   }, [booked, machine.expiryTime, getTimeRemaining]);

// //   return (
// //     <TouchableOpacity
// //       style={[styles.machineCard, booked && styles.bookedMachine]}
// //       onPress={onPress}
// //       disabled={booked} // Disables press if already booked
// //     >
// //       <Image
// //         source={require('../assets/image.png')}
// //         style={styles.machineIcon}
// //       />
// //       <Text style={styles.machineText}>No. {machine.number}</Text>
      
// //       {booked && (
// //         <View style={styles.bookedInfo}>
// //           {machine.expiryTime && (
// //             <Text style={styles.timerText}>
// //               {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Time expired'}
// //             </Text>
// //           )}
// //           {machine.bookedBy && (
// //             <Text style={styles.bookedByText}>
// //               Booked by: {machine.userName || 'User'}
// //             </Text>
// //           )}
// //         </View>
// //       )}
      
// //       {!booked && machine.lastUsedBy && (
// //         <View style={styles.lastUserInfo}>
// //           <Text style={styles.lastUserText}>Last used by:</Text>
// //           <Text style={styles.lastUserName}>{machine.lastUserName}</Text>
// //           <Text style={styles.lastUserMobile}>{machine.lastUserMobile}</Text>
// //         </View>
// //       )}
// //     </TouchableOpacity>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
// //   heading: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //     marginBottom: 5,
// //   },
// //   subheading: {
// //     fontSize: 14,
// //     color: 'green',
// //     textAlign: 'center',
// //     marginBottom: 20,
// //   },
// //   loaderContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 20,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     marginBottom: 10,
// //   },
// //   grid: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     justifyContent: 'space-between',
// //   },
// //   machineCard: {
// //     width: '45%',
// //     backgroundColor: 'white',
// //     padding: 20,
// //     borderRadius: 10,
// //     alignItems: 'center',
// //     marginBottom: 15,
// //     elevation: 3,
// //   },
// //   bookedMachine: {
// //     backgroundColor: '#f0f0f0', // Slightly lighter grey for booked machines
// //   },
// //   machineIcon: {
// //     width: 40,
// //     height: 40,
// //     marginBottom: 10,
// //   },
// //   machineText: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     marginBottom: 5,
// //   },
// //   noMachinesText: {
// //     textAlign: 'center',
// //     fontSize: 16,
// //     color: '#999',
// //     marginVertical: 10,
// //   },
// //   bookedInfo: {
// //     marginTop: 5,
// //     alignItems: 'center',
// //   },
// //   timerText: {
// //     fontSize: 14,
// //     fontWeight: 'bold',
// //     color: '#E53935', // Red color for timer
// //     marginBottom: 5,
// //   },
// //   bookedByText: {
// //     fontSize: 12,
// //     color: '#555',
// //   },
// //   lastUserInfo: {
// //     marginTop: 5,
// //     alignItems: 'center',
// //     padding: 5,
// //     backgroundColor: '#f9f9f9',
// //     borderRadius: 5,
// //     width: '100%',
// //   },
// //   lastUserText: {
// //     fontSize: 12,
// //     color: '#555',
// //   },
// //   lastUserName: {
// //     fontSize: 13,
// //     fontWeight: 'bold',
// //     color: '#333',
// //   },
// //   lastUserMobile: {
// //     fontSize: 12,
// //     color: '#666',
// //   },
// // });

// // export default MachinePage;


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';

// const MachinePage = () => {
//   const [availableMachines, setAvailableMachines] = useState([]);
//   const [bookedMachines, setBookedMachines] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userHasBooking, setUserHasBooking] = useState(false);
//   const currentUser = auth().currentUser;

//   useEffect(() => {
//     // Set up real-time listener for machine collection
//     const unsubscribe = firestore()
//       .collection('machines')
//       .onSnapshot(
//         snapshot => {
//           const available = [];
//           const booked = [];
//           let hasBooking = false;

//           snapshot.forEach(doc => {
//             const data = doc.data();
//             if (data.inUse === false && data.underMaintenance !== true) {
//               available.push({ id: doc.id, ...data });
//             } else if (data.inUse === true) {
//               // Check if current user has a booking
//               if (data.bookedBy === currentUser?.email) {
//                 hasBooking = true;
//               }
//               booked.push({ id: doc.id, ...data });
//             }
//           });

//           setAvailableMachines(available);
//           setBookedMachines(booked);
//           setUserHasBooking(hasBooking);
//           setLoading(false);
//         },
//         error => {
//           console.error('Error listening to machines collection:', error);
//           Alert.alert('Error', 'Failed to load machine data.');
//           setLoading(false);
//         }
//       );

//     // Clean up the listener when component unmounts
//     return () => unsubscribe();
//   }, [currentUser]);

//   const handleBookMachine = async (machine) => {
//     try {
//       if (!currentUser) {
//         Alert.alert('Error', 'You must be logged in to book a machine.');
//         return;
//       }

//       if (machine.inUse) {
//         return; // Do nothing if the machine is already booked
//       }

//       // Check if user already has a booking
//       if (userHasBooking) {
//         Alert.alert('Error', 'You can only book one machine at a time.');
//         return;
//       }

//       // Fetch user details from students collection
//       const userQuery = await firestore()
//         .collection('students')
//         .where('Email', '==', currentUser.email)
//         .limit(1)
//         .get();

//       let userDetails = {};
//       if (!userQuery.empty) {
//         userDetails = userQuery.docs[0].data();
//       }

//       // Calculate expiry time (15 seconds from now)
//       const expiryTime = new Date();
//       expiryTime.setSeconds(expiryTime.getSeconds() + 15);

//       const machineRef = firestore().collection('machines').doc(machine.id);
//       await machineRef.update({ 
//         inUse: true, 
//         bookedBy: currentUser.email,
//         bookingTime: firestore.FieldValue.serverTimestamp(),
//         status: 'in-use',
//         expiryTime: expiryTime.toISOString(),
//         userName: userDetails.name || '',
//         userMobile: userDetails.MobileNo || '',
//         autoUnbooked: false // Flag to track if auto-unbooked
//       });

//       // Set a timer to auto-unbook the machine
//       setTimeout(() => {
//         autoUnbookMachine(machine.id, currentUser.email);
//       }, 15000); // 15 seconds

//       Alert.alert(`Success! Machine No. ${machine.number} booked!`);
//     } catch (error) {
//       console.error('Error booking machine:', error);
//       Alert.alert('Error', 'Failed to book machine.');
//     }
//   };

//   const autoUnbookMachine = async (machineId, userEmail) => {
//     try {
//       // Check if the machine is still booked by this user
//       const machineDoc = await firestore().collection('machines').doc(machineId).get();
//       const machineData = machineDoc.data();
      
//       if (!machineData || machineData.bookedBy !== userEmail) {
//         return; // Machine is already unbooked or booked by someone else
//       }

//       // Get user details
//       const userQuerySnapshot = await firestore()
//         .collection('students')
//         .where('Email', '==', userEmail)
//         .limit(1)
//         .get();

//       if (!userQuerySnapshot.empty) {
//         const userDoc = userQuerySnapshot.docs[0].ref;
//         const userData = userQuerySnapshot.docs[0].data();

//         let updatedLastUses = userData.lastUses || ["", "", "", "", ""];
//         const newEntry = new Date().toISOString();

//         // Shift array and add new entry
//         updatedLastUses.shift();
//         updatedLastUses.push(newEntry);

//         // Update user's lastUses
//         await userDoc.update({
//           lastUses: updatedLastUses,
//         });
//       }

//       // Update machine status but keep user info for display
//       // Set the autoUnbooked flag to true
//       await firestore().collection('machines').doc(machineId).update({
//         inUse: false,
//         bookedBy: null,
//         status: 'available',
//         lastUsedBy: userEmail,
//         lastUserName: machineData.userName,
//         lastUserMobile: machineData.userMobile,
//         lastUsedTime: new Date().toISOString(),
//         autoUnbooked: true // Flag to indicate auto-unbook
//       });

//       console.log(`Machine ${machineId} auto-unbooked due to timeout`);
//     } catch (error) {
//       console.error('Error auto-unbooking machine:', error);
//     }
//   };

//   // Calculate time remaining for a machine
//   const getTimeRemaining = (expiryTimeStr) => {
//     if (!expiryTimeStr) return 0;
    
//     const expiryTime = new Date(expiryTimeStr);
//     const now = new Date();
//     const diffMs = expiryTime - now;
    
//     return Math.max(0, Math.floor(diffMs / 1000)); // Return seconds remaining
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.heading}>LNMIIT, Jaipur</Text>
//       <Text style={styles.subheading}>
//         {availableMachines.length} machines available
//       </Text>

//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#3D4EB0" />
//         </View>
//       ) : (
//         <>
//           <Text style={styles.sectionTitle}>Available washing machines</Text>
//           <View style={styles.grid}>
//             {availableMachines.length > 0 ? (
//               availableMachines.map(machine => (
//                 <MachineCard
//                   key={machine.id}
//                   machine={machine}
//                   onPress={() => handleBookMachine(machine)}
//                 />
//               ))
//             ) : (
//               <Text style={styles.noMachinesText}>No available machines</Text>
//             )}
//           </View>

//           <Text style={styles.sectionTitle}>Booked washing machines</Text>
//           <View style={styles.grid}>
//             {bookedMachines.length > 0 ? (
//               bookedMachines.map(machine => (
//                 <MachineCard 
//                   key={machine.id} 
//                   machine={machine} 
//                   booked 
//                   getTimeRemaining={getTimeRemaining}
//                 />
//               ))
//             ) : (
//               <Text style={styles.noMachinesText}>No booked machines</Text>
//             )}
//           </View>
//         </>
//       )}
//     </ScrollView>
//   );
// };

// // const MachineCard = ({ machine, onPress, booked, getTimeRemaining }) => {
// //   const [timeRemaining, setTimeRemaining] = useState(0);
  
// //   useEffect(() => {
// //     let timer;
// //     if (booked && machine.expiryTime) {
// //       // Set initial time
// //       setTimeRemaining(getTimeRemaining(machine.expiryTime));
      
// //       // Update timer every second
// //       timer = setInterval(() => {
// //         const remaining = getTimeRemaining(machine.expiryTime);
// //         setTimeRemaining(remaining);
// //         if (remaining <= 0) {
// //           clearInterval(timer);
// //         }
// //       }, 1000);
// //     }
    
// //     return () => {
// //       if (timer) clearInterval(timer);
// //     };
// //   }, [booked, machine.expiryTime, getTimeRemaining]);

// //   return (
// //     <TouchableOpacity
// //       style={[styles.machineCard, booked && styles.bookedMachine]}
// //       onPress={onPress}
// //       disabled={booked} // Disables press if already booked
// //     >
// //       <Image
// //         source={require('../assets/image.png')}
// //         style={styles.machineIcon}
// //       />
// //       <Text style={styles.machineText}>No. {machine.number}</Text>
      
// //       {booked && (
// //         <View style={styles.bookedInfo}>
// //           {machine.expiryTime && (
// //             <Text style={styles.timerText}>
// //               {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Time expired'}
// //             </Text>
// //           )}
// //           {machine.bookedBy && (
// //             <Text style={styles.bookedByText}>
// //               Booked by: {machine.userName || 'User'}
// //             </Text>
// //           )}
// //         </View>
// //       )}
      
// //       {/* Only show user details on machines that were auto-unbooked */}
// //       {!booked && machine.autoUnbooked === true && (
// //         <View style={styles.lastUserInfo}>
// //           <Text style={styles.lastUserText}>Last used by:</Text>
// //           <Text style={styles.lastUserName}>{machine.lastUserName}</Text>
// //           <Text style={styles.lastUserMobile}>{machine.lastUserMobile}</Text>
// //         </View>
// //       )}
// //     </TouchableOpacity>
// //   );
// // };

// const MachineCard = ({ machine, onPress, booked, getTimeRemaining }) => {
//   const [timeRemaining, setTimeRemaining] = useState(0);
  
//   useEffect(() => {
//     let timer;
//     if (booked && machine.expiryTime) {
//       // Set initial time
//       setTimeRemaining(getTimeRemaining(machine.expiryTime));
      
//       // Update timer every second
//       timer = setInterval(() => {
//         const remaining = getTimeRemaining(machine.expiryTime);
//         setTimeRemaining(remaining);
//         if (remaining <= 0) {
//           clearInterval(timer);
//         }
//       }, 1000);
//     }
    
//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [booked, machine.expiryTime, getTimeRemaining]);

//   return (
//     <TouchableOpacity
//       style={[styles.machineCard, booked && styles.bookedMachine]}
//       onPress={onPress}
//       disabled={booked} // Disables press if already booked
//     >
//       <Image
//         source={require('../assets/image.png')}
//         style={styles.machineIcon}
//       />
//       <Text style={styles.machineText}>No. {machine.number}</Text>
      
//       {booked && (
//         <View style={styles.bookedInfo}>
//           {machine.expiryTime && (
//             <Text style={styles.timerText}>
//               {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Time expired'}
//             </Text>
//           )}
//           <Text style={styles.bookedByText}>
//             In use
//           </Text>
//         </View>
//       )}
      
//       {/* Only show user details on machines that were auto-unbooked */}
//       {!booked && machine.autoUnbooked === true && (
//         <View style={styles.lastUserInfo}>
//           <Text style={styles.lastUserText}>Last used by:</Text>
//           <Text style={styles.lastUserName}>{machine.lastUserName}</Text>
//           <Text style={styles.lastUserMobile}>{machine.lastUserMobile}</Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
//   heading: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 5,
//   },
//   subheading: {
//     fontSize: 14,
//     color: 'green',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   machineCard: {
//     width: '45%',
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 15,
//     elevation: 3,
//   },
//   bookedMachine: {
//     backgroundColor: '#f0f0f0', // Slightly lighter grey for booked machines
//   },
//   machineIcon: {
//     width: 40,
//     height: 40,
//     marginBottom: 10,
//   },
//   machineText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   noMachinesText: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#999',
//     marginVertical: 10,
//   },
//   bookedInfo: {
//     marginTop: 5,
//     alignItems: 'center',
//   },
//   timerText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#E53935', // Red color for timer
//     marginBottom: 5,
//   },
//   bookedByText: {
//     fontSize: 12,
//     color: '#555',
//   },
//   lastUserInfo: {
//     marginTop: 5,
//     alignItems: 'center',
//     padding: 5,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 5,
//     width: '100%',
//   },
//   lastUserText: {
//     fontSize: 12,
//     color: '#555',
//   },
//   lastUserName: {
//     fontSize: 13,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   lastUserMobile: {
//     fontSize: 12,
//     color: '#666',
//   },
// });

// export default MachinePage;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const MachinePage = () => {
  const [availableMachines, setAvailableMachines] = useState([]);
  const [bookedMachines, setBookedMachines] = useState([]);
  const [maintenanceMachines, setMaintenanceMachines] = useState([]); // New state for maintenance machines
  const [loading, setLoading] = useState(true);
  const [userHasBooking, setUserHasBooking] = useState(false);
  const currentUser = auth().currentUser;

  useEffect(() => {
    // Set up real-time listener for machine collection
    const unsubscribe = firestore()
      .collection('machines')
      .onSnapshot(
        snapshot => {
          const available = [];
          const booked = [];
          const maintenance = []; // Array for machines under maintenance
          let hasBooking = false;

          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.underMaintenance === true) {
              // Add to maintenance array if under maintenance
              maintenance.push({ id: doc.id, ...data });
            } else if (data.inUse === true) {
              // Check if current user has a booking
              if (data.bookedBy === currentUser?.email) {
                hasBooking = true;
              }
              booked.push({ id: doc.id, ...data });
            } else {
              // Only add to available if not under maintenance and not in use
              available.push({ id: doc.id, ...data });
            }
          });

          // Sort machines by number for consistent display
          available.sort((a, b) => (a.number || 0) - (b.number || 0));
          booked.sort((a, b) => (a.number || 0) - (b.number || 0));
          maintenance.sort((a, b) => (a.number || 0) - (b.number || 0));

          setAvailableMachines(available);
          setBookedMachines(booked);
          setMaintenanceMachines(maintenance);
          setUserHasBooking(hasBooking);
          setLoading(false);
        },
        error => {
          console.error('Error listening to machines collection:', error);
          Alert.alert('Error', 'Failed to load machine data.');
          setLoading(false);
        }
      );

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [currentUser]);

  const handleBookMachine = async (machine) => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to book a machine.');
        return;
      }

      if (machine.inUse) {
        return; // Do nothing if the machine is already booked
      }

      // Check if user already has a booking
      if (userHasBooking) {
        Alert.alert('Error', 'You can only book one machine at a time.');
        return;
      }

      // Fetch user details from students collection
      const userQuery = await firestore()
        .collection('students')
        .where('Email', '==', currentUser.email)
        .limit(1)
        .get();

      let userDetails = {};
      if (!userQuery.empty) {
        userDetails = userQuery.docs[0].data();
      }

      // Calculate expiry time (15 seconds from now)
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + 15);

      const machineRef = firestore().collection('machines').doc(machine.id);
      await machineRef.update({ 
        inUse: true, 
        bookedBy: currentUser.email,
        bookingTime: firestore.FieldValue.serverTimestamp(),
        status: 'in-use',
        expiryTime: expiryTime.toISOString(),
        userName: userDetails.name || '',
        userMobile: userDetails.MobileNo || '',
        autoUnbooked: false // Flag to track if auto-unbooked
      });

      // Set a timer to auto-unbook the machine
      setTimeout(() => {
        autoUnbookMachine(machine.id, currentUser.email);
      }, 15000); // 15 seconds

      Alert.alert(`Success! Machine No. ${machine.number} booked!`);
    } catch (error) {
      console.error('Error booking machine:', error);
      Alert.alert('Error', 'Failed to book machine.');
    }
  };

  const autoUnbookMachine = async (machineId, userEmail) => {
    try {
      // Check if the machine is still booked by this user
      const machineDoc = await firestore().collection('machines').doc(machineId).get();
      const machineData = machineDoc.data();
      
      if (!machineData || machineData.bookedBy !== userEmail) {
        return; // Machine is already unbooked or booked by someone else
      }

      // Get user details
      const userQuerySnapshot = await firestore()
        .collection('students')
        .where('Email', '==', userEmail)
        .limit(1)
        .get();

      if (!userQuerySnapshot.empty) {
        const userDoc = userQuerySnapshot.docs[0].ref;
        const userData = userQuerySnapshot.docs[0].data();

        let updatedLastUses = userData.lastUses || ["", "", "", "", ""];
        const newEntry = new Date().toISOString();

        // Shift array and add new entry
        updatedLastUses.shift();
        updatedLastUses.push(newEntry);

        // Update user's lastUses
        await userDoc.update({
          lastUses: updatedLastUses,
        });
      }

      // Update machine status but keep user info for display
      // Set the autoUnbooked flag to true
      await firestore().collection('machines').doc(machineId).update({
        inUse: false,
        bookedBy: null,
        status: 'available',
        lastUsedBy: userEmail,
        lastUserName: machineData.userName,
        lastUserMobile: machineData.userMobile,
        lastUsedTime: new Date().toISOString(),
        autoUnbooked: true // Flag to indicate auto-unbook
      });

      console.log(`Machine ${machineId} auto-unbooked due to timeout`);
    } catch (error) {
      console.error('Error auto-unbooking machine:', error);
    }
  };

  // Calculate time remaining for a machine
  const getTimeRemaining = (expiryTimeStr) => {
    if (!expiryTimeStr) return 0;
    
    const expiryTime = new Date(expiryTimeStr);
    const now = new Date();
    const diffMs = expiryTime - now;
    
    return Math.max(0, Math.floor(diffMs / 1000)); // Return seconds remaining
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>LNMIIT, Jaipur</Text>
      <Text style={styles.subheading}>
        {availableMachines.length} machines available
      </Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3D4EB0" />
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Available washing machines</Text>
          <View style={styles.grid}>
            {availableMachines.length > 0 ? (
              availableMachines.map(machine => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  onPress={() => handleBookMachine(machine)}
                />
              ))
            ) : (
              <Text style={styles.noMachinesText}>No available machines</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Booked washing machines</Text>
          <View style={styles.grid}>
            {bookedMachines.length > 0 ? (
              bookedMachines.map(machine => (
                <MachineCard 
                  key={machine.id} 
                  machine={machine} 
                  booked 
                  getTimeRemaining={getTimeRemaining}
                />
              ))
            ) : (
              <Text style={styles.noMachinesText}>No booked machines</Text>
            )}
          </View>
          
          {/* New section for machines under maintenance */}
          <Text style={styles.sectionTitle}>Machines under maintenance</Text>
          <View style={styles.grid}>
            {maintenanceMachines.length > 0 ? (
              maintenanceMachines.map(machine => (
                <MachineCard 
                  key={machine.id} 
                  machine={machine} 
                  maintenance
                  disabled
                />
              ))
            ) : (
              <Text style={styles.noMachinesText}>No machines under maintenance</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const MachineCard = ({ machine, onPress, booked, maintenance, getTimeRemaining }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  useEffect(() => {
    let timer;
    if (booked && machine.expiryTime) {
      // Set initial time
      setTimeRemaining(getTimeRemaining(machine.expiryTime));
      
      // Update timer every second
      timer = setInterval(() => {
        const remaining = getTimeRemaining(machine.expiryTime);
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [booked, machine.expiryTime, getTimeRemaining]);

  return (
    <TouchableOpacity
      style={[
        styles.machineCard, 
        booked && styles.bookedMachine,
        maintenance && styles.maintenanceMachine
      ]}
      onPress={onPress}
      disabled={booked || maintenance} // Disable press if booked or under maintenance
    >
      <Image
        source={require('../assets/image.png')}
        style={styles.machineIcon}
      />
      <Text style={styles.machineText}>No. {machine.number}</Text>
      
      {booked && (
        <View style={styles.bookedInfo}>
          {machine.expiryTime && (
            <Text style={styles.timerText}>
              {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Time expired'}
            </Text>
          )}
          <Text style={styles.bookedByText}>
            In use
          </Text>
        </View>
      )}
      
      {maintenance && (
        <View style={styles.maintenanceInfo}>
          <Text style={styles.maintenanceText}>Under Maintenance</Text>
        </View>
      )}
      
      {/* Only show user details on machines that were auto-unbooked */}
      {!booked && !maintenance && machine.autoUnbooked === true && (
        <View style={styles.lastUserInfo}>
          <Text style={styles.lastUserText}>Last used by:</Text>
          <Text style={styles.lastUserName}>{machine.lastUserName}</Text>
          <Text style={styles.lastUserMobile}>{machine.lastUserMobile}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subheading: {
    fontSize: 14,
    color: 'green',
    textAlign: 'center',
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  machineCard: {
    width: '45%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  bookedMachine: {
    backgroundColor: '#f0f0f0', // Slightly lighter grey for booked machines
  },
  maintenanceMachine: {
    backgroundColor: '#FCFAE8', // Light red for maintenance machines
  },
  machineIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  machineText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noMachinesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginVertical: 10,
  },
  bookedInfo: {
    marginTop: 5,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935', // Red color for timer
    marginBottom: 5,
  },
  bookedByText: {
    fontSize: 12,
    color: '#555',
  },
  maintenanceInfo: {
    marginTop: 5,
    alignItems: 'center',
  },
  maintenanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935', // Red color for maintenance text
  },
  lastUserInfo: {
    marginTop: 5,
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    width: '100%',
  },
  lastUserText: {
    fontSize: 12,
    color: '#555',
  },
  lastUserName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  lastUserMobile: {
    fontSize: 12,
    color: '#666',
  },
});

export default MachinePage;