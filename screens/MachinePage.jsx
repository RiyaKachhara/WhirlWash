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

// const MachinePage = () => { // Add navigation prop here
//   const [availableMachines, setAvailableMachines] = useState([]);
//   const [bookedMachines, setBookedMachines] = useState([]);
//   const [maintenanceMachines, setMaintenanceMachines] = useState([]); // New state for maintenance machines
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
//           const maintenance = []; // Array for machines under maintenance
//           let hasBooking = false;

//           snapshot.forEach(doc => {
//             const data = doc.data();
//             if (data.underMaintenance === true) {
//               // Add to maintenance array if under maintenance
//               maintenance.push({ id: doc.id, ...data });
//             } else if (data.inUse === true) {
//               // Check if current user has a booking
//               if (data.bookedBy === currentUser?.email) {
//                 hasBooking = true;
//               }
//               booked.push({ id: doc.id, ...data });
//             } else {
//               // Only add to available if not under maintenance and not in use
//               available.push({ id: doc.id, ...data });
//             }
//           });

//           // Sort machines by number for consistent display
//           available.sort((a, b) => (a.number || 0) - (b.number || 0));
//           booked.sort((a, b) => (a.number || 0) - (b.number || 0));
//           maintenance.sort((a, b) => (a.number || 0) - (b.number || 0));

//           setAvailableMachines(available);
//           setBookedMachines(booked);
//           setMaintenanceMachines(maintenance);
//           setUserHasBooking(hasBooking);
//           setLoading(false);

//           // If user has a booking, navigate to LaundryProgress
//           // if (hasBooking && !userHasBooking) {
//           //   navigation.navigate('LaundryProgress');
//           // }
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
//       expiryTime.setSeconds(expiryTime.getSeconds() + 45);

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
//       }, 45000); // 15 seconds

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
          
//           {/* New section for machines under maintenance */}
//           <Text style={styles.sectionTitle}>Machines under maintenance</Text>
//           <View style={styles.grid}>
//             {maintenanceMachines.length > 0 ? (
//               maintenanceMachines.map(machine => (
//                 <MachineCard 
//                   key={machine.id} 
//                   machine={machine} 
//                   maintenance
//                   disabled
//                 />
//               ))
//             ) : (
//               <Text style={styles.noMachinesText}>No machines under maintenance</Text>
//             )}
//           </View>
//         </>
//       )}
//     </ScrollView>
//   );
// };

// const MachineCard = ({ machine, onPress, booked, maintenance, getTimeRemaining }) => {
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
//       style={[
//         styles.machineCard, 
//         booked && styles.bookedMachine,
//         maintenance && styles.maintenanceMachine
//       ]}
//       onPress={onPress}
//       disabled={booked || maintenance} // Disable press if booked or under maintenance
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
      
//       {maintenance && (
//         <View style={styles.maintenanceInfo}>
//           <Text style={styles.maintenanceText}>Under Maintenance</Text>
//         </View>
//       )}
      
//       {/* Only show user details on machines that were auto-unbooked */}
//       {!booked && !maintenance && machine.autoUnbooked === true && (
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
//   maintenanceMachine: {
//     backgroundColor: '#FCFAE8', // Light red for maintenance machines
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
//   maintenanceInfo: {
//     marginTop: 5,
//     alignItems: 'center',
//   },
//   maintenanceText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#E53935', // Red color for maintenance text
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


//second try


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   Image,
//   Animated,
// } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';

// const MachinePage = ({ navigation }) => {
//   const [availableMachines, setAvailableMachines] = useState([]);
//   const [pendingQRMachines, setPendingQRMachines] = useState([]);
//   const [bookedMachines, setBookedMachines] = useState([]);
//   const [maintenanceMachines, setMaintenanceMachines] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userHasBooking, setUserHasBooking] = useState(false);
//   const [userHasPendingQR, setUserHasPendingQR] = useState(false);
//   const currentUser = auth().currentUser;

//   useEffect(() => {
//     // Set up real-time listener for machine collection
//     const unsubscribe = firestore()
//       .collection('machines')
//       .onSnapshot(
//         snapshot => {
//           const available = [];
//           const pendingQR = [];
//           const booked = [];
//           const maintenance = [];
//           let hasBooking = false;
//           let hasPendingQR = false;

//           snapshot.forEach(doc => {
//             const data = doc.data();
//             if (data.underMaintenance === true) {
//               maintenance.push({ id: doc.id, ...data });
//             } else if (data.pendingQRScan === true) {
//               // Check if current user has a QR pending
//               if (data.bookedBy === currentUser?.email) {
//                 hasPendingQR = true;
//               }
//               pendingQR.push({ id: doc.id, ...data });
//             } else if (data.inUse === true) {
//               // Check if current user has a booking
//               if (data.bookedBy === currentUser?.email) {
//                 hasBooking = true;
//               }
//               booked.push({ id: doc.id, ...data });
//             } else {
//               available.push({ id: doc.id, ...data });
//             }
//           });

//           // Sort machines by number for consistent display
//           available.sort((a, b) => (a.number || 0) - (b.number || 0));
//           pendingQR.sort((a, b) => (a.number || 0) - (b.number || 0));
//           booked.sort((a, b) => (a.number || 0) - (b.number || 0));
//           maintenance.sort((a, b) => (a.number || 0) - (b.number || 0));

//           setAvailableMachines(available);
//           setPendingQRMachines(pendingQR);
//           setBookedMachines(booked);
//           setMaintenanceMachines(maintenance);
//           setUserHasBooking(hasBooking);
//           setUserHasPendingQR(hasPendingQR);
//           setLoading(false);
//         },
//         error => {
//           console.error('Error listening to machines collection:', error);
//           Alert.alert('Error', 'Failed to load machine data.');
//           setLoading(false);
//         }
//       );

//     // Set up listener for QR scan confirmation
//     const qrScanListener = firestore()
//       .collection('machines')
//       .where('bookedBy', '==', currentUser?.email)
//       .where('pendingQRScan', '==', false)
//       .where('inUse', '==', true)
//       .onSnapshot(snapshot => {
//         const freshlyScannedMachines = snapshot.docChanges().filter(
//           change => change.type === 'modified' || change.type === 'added'
//         );
        
//         if (freshlyScannedMachines.length > 0) {
//           // Find machines that just got their QR scanned
//           const qrJustScanned = freshlyScannedMachines.some(change => {
//             const data = change.doc.data();
//             // Check if this machine was just scanned by comparing timestamps
//             const now = new Date();
//             const bookingTime = data.qrScannedTime ? new Date(data.qrScannedTime) : null;
            
//             // If booking time is within the last 5 seconds, consider it just scanned
//             return bookingTime && (now - bookingTime) / 1000 < 5;
//           });
          
//           if (qrJustScanned) {
//             // Alert user that their time has started
//             Alert.alert('Your Laundry Time Has Started', 'You have 45 seconds to use the machine.');
//           }
//         }
//       });

//     // Clean up the listeners when component unmounts
//     return () => {
//       unsubscribe();
//       qrScanListener();
//     };
//   }, [currentUser]);

//   const handleBookMachine = async (machine) => {
//     try {
//       if (!currentUser) {
//         Alert.alert('Error', 'You must be logged in to book a machine.');
//         return;
//       }

//       // Check if user already has a booking or pending QR
//       if (userHasBooking || userHasPendingQR) {
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

//       // Calculate QR scan expiry time (40 seconds from now)
//       const qrScanExpiryTime = new Date();
//       qrScanExpiryTime.setSeconds(qrScanExpiryTime.getSeconds() + 40);

//       // Generate a unique QR code value (this would normally be more complex)
//       const qrCodeValue = `machine-${machine.number}-${Date.now()}-${currentUser.uid.substring(0, 6)}`;

//       const machineRef = firestore().collection('machines').doc(machine.id);
//       await machineRef.update({ 
//         pendingQRScan: true,
//         inUse: false,
//         bookedBy: currentUser.email,
//         bookingTime: firestore.FieldValue.serverTimestamp(),
//         status: 'pending-qr',
//         qrScanExpiryTime: qrScanExpiryTime.toISOString(),
//         userName: userDetails.name || '',
//         userMobile: userDetails.MobileNo || '',
//         autoUnbooked: false,
//         qrCodeValue: qrCodeValue // Store QR code value
//       });

//       // Set a timer to auto-release if QR not scanned
//       setTimeout(() => {
//         autoReleaseIfQRNotScanned(machine.id, currentUser.email);
//       }, 40000); // 40 seconds

//       Alert.alert(
//         'Machine Reserved', 
//         `Machine No. ${machine.number} reserved! Please bring your laundry and flip the card to show QR code to admin for scanning. You have 40 seconds.`
//       );
//     } catch (error) {
//       console.error('Error booking machine:', error);
//       Alert.alert('Error', 'Failed to book machine.');
//     }
//   };

//   const autoReleaseIfQRNotScanned = async (machineId, userEmail) => {
//     try {
//       // Check if the machine is still in pendingQRScan state
//       const machineDoc = await firestore().collection('machines').doc(machineId).get();
//       const machineData = machineDoc.data();
      
//       if (!machineData || machineData.pendingQRScan !== true || machineData.bookedBy !== userEmail) {
//         return; // Machine is not in pending QR state or not booked by this user
//       }

//       // Reset machine to available
//       await firestore().collection('machines').doc(machineId).update({
//         pendingQRScan: false,
//         bookedBy: null,
//         status: 'available',
//         qrScanExpiryTime: null,
//         userName: '',
//         userMobile: '',
//         qrCodeValue: null
//       });

//       Alert.alert(
//         'Reservation Expired',
//         'Your reservation has expired because the QR code was not scanned in time.'
//       );

//       console.log(`Machine ${machineId} auto-released due to QR scan timeout`);
//     } catch (error) {
//       console.error('Error auto-releasing machine:', error);
//     }
//   };

//   const handleUnbookMachine = async (machine) => {
//     try {
//       if (!currentUser || machine.bookedBy !== currentUser.email) {
//         Alert.alert('Error', 'You can only unbook your own machines.');
//         return;
//       }

//       await firestore().collection('machines').doc(machine.id).update({
//         inUse: false,
//         bookedBy: null,
//         status: 'available',
//         lastUsedBy: currentUser.email,
//         lastUserName: machine.userName,
//         lastUserMobile: machine.userMobile,
//         lastUsedTime: new Date().toISOString(),
//         expiryTime: null,
//         autoUnbooked: false
//       });

//       Alert.alert('Success', `Machine No. ${machine.number} has been unbooked.`);
//     } catch (error) {
//       console.error('Error unbooking machine:', error);
//       Alert.alert('Error', 'Failed to unbook machine.');
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

//           <Text style={styles.sectionTitle}>Pending QR scan</Text>
//           <View style={styles.grid}>
//             {pendingQRMachines.length > 0 ? (
//               pendingQRMachines.map(machine => (
//                 <FlippableMachineCard 
//                   key={machine.id} 
//                   machine={machine} 
//                   pendingQR
//                   getTimeRemaining={getTimeRemaining}
//                   isCurrentUser={machine.bookedBy === currentUser?.email}
//                 />
//               ))
//             ) : (
//               <Text style={styles.noMachinesText}>No machines awaiting QR scan</Text>
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
//                   isCurrentUser={machine.bookedBy === currentUser?.email}
//                   onUnbook={() => handleUnbookMachine(machine)}
//                 />
//               ))
//             ) : (
//               <Text style={styles.noMachinesText}>No booked machines</Text>
//             )}
//           </View>
          
//           <Text style={styles.sectionTitle}>Machines under maintenance</Text>
//           <View style={styles.grid}>
//             {maintenanceMachines.length > 0 ? (
//               maintenanceMachines.map(machine => (
//                 <MachineCard 
//                   key={machine.id} 
//                   machine={machine} 
//                   maintenance
//                   disabled
//                 />
//               ))
//             ) : (
//               <Text style={styles.noMachinesText}>No machines under maintenance</Text>
//             )}
//           </View>
//         </>
//       )}
//     </ScrollView>
//   );
// };

// // Regular Machine Card for available, booked, and maintenance machines
// const MachineCard = ({ 
//   machine, 
//   onPress, 
//   onUnbook,
//   booked, 
//   maintenance, 
//   getTimeRemaining,
//   isCurrentUser 
// }) => {
//   const [timeRemaining, setTimeRemaining] = useState(0);
  
//   useEffect(() => {
//     let timer;
    
//     if (booked && machine.expiryTime) {
//       // Set initial time for usage timer
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
//       style={[
//         styles.machineCard, 
//         booked && styles.bookedMachine,
//         maintenance && styles.maintenanceMachine,
//         isCurrentUser && styles.currentUserMachine
//       ]}
//       onPress={onPress}
//       disabled={booked || maintenance} // Disable press if not available
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
//           {isCurrentUser && onUnbook && (
//             <TouchableOpacity 
//               style={styles.unbookButton}
//               onPress={onUnbook}
//             >
//               <Text style={styles.unbookButtonText}>Unbook</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}
      
//       {maintenance && (
//         <View style={styles.maintenanceInfo}>
//           <Text style={styles.maintenanceText}>Under Maintenance</Text>
//         </View>
//       )}
      
//       {!booked && !maintenance && machine.lastUsedBy && (
//         <View style={styles.lastUserInfo}>
//           <Text style={styles.lastUserText}>Last used by:</Text>
//           <Text style={styles.lastUserName}>{machine.lastUserName}</Text>
//           <Text style={styles.lastUserMobile}>{machine.lastUserMobile}</Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// };

// // Flippable Card Component for Pending QR Machines
// const FlippableMachineCard = ({ 
//   machine, 
//   pendingQR, 
//   getTimeRemaining,
//   isCurrentUser 
// }) => {
//   const [isFlipped, setIsFlipped] = useState(false);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const flipAnimation = useRef(new Animated.Value(0)).current;
  
//   useEffect(() => {
//     let timer;
    
//     if (pendingQR && machine.qrScanExpiryTime) {
//       // Set initial time for QR scan timer
//       setTimeRemaining(getTimeRemaining(machine.qrScanExpiryTime));
      
//       // Update timer every second
//       timer = setInterval(() => {
//         const remaining = getTimeRemaining(machine.qrScanExpiryTime);
//         setTimeRemaining(remaining);
//         if (remaining <= 0) {
//           clearInterval(timer);
//         }
//       }, 1000);
//     }
    
//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [pendingQR, machine.qrScanExpiryTime, getTimeRemaining]);

//   // Handle card flip
//   const flipCard = () => {
//     if (!isCurrentUser) return; // Only allow current user to flip their card
    
//     Animated.spring(flipAnimation, {
//       toValue: isFlipped ? 0 : 1,
//       friction: 8,
//       tension: 10,
//       useNativeDriver: true,
//     }).start();
    
//     setIsFlipped(!isFlipped);
//   };

//   // Interpolate for front and back animations
//   const frontAnimatedStyle = {
//     transform: [
//       {
//         rotateY: flipAnimation.interpolate({
//           inputRange: [0, 1],
//           outputRange: ['0deg', '180deg'],
//         }),
//       },
//     ],
//   };

//   const backAnimatedStyle = {
//     transform: [
//       {
//         rotateY: flipAnimation.interpolate({
//           inputRange: [0, 1],
//           outputRange: ['180deg', '360deg'],
//         }),
//       },
//     ],
//   };

//   return (
//     <TouchableOpacity
//       style={[
//         styles.flippableCardContainer,
//         isCurrentUser && styles.currentUserMachine,
//       ]}
//       onPress={flipCard}
//       activeOpacity={0.9}
//       disabled={!isCurrentUser}
//     >
//       {/* Front Side - Machine Info */}
//       <Animated.View
//         style={[
//           styles.machineCard,
//           styles.pendingQRMachine,
//           styles.cardFace,
//           frontAnimatedStyle,
//           { opacity: flipAnimation.interpolate({
//             inputRange: [0, 0.5, 1],
//             outputRange: [1, 0, 0]
//           }) }
//         ]}
//       >
//         <Image
//           source={require('../assets/image.png')}
//           style={styles.machineIcon}
//         />
//         <Text style={styles.machineText}>No. {machine.number}</Text>
        
//         <View style={styles.pendingQRInfo}>
//           {machine.qrScanExpiryTime && (
//             <Text style={styles.timerText}>
//               {timeRemaining > 0 ? `${timeRemaining}s to scan QR` : 'QR scan time expired'}
//             </Text>
//           )}
//           <Text style={styles.pendingQRText}>
//             Awaiting QR Scan
//           </Text>
//           {isCurrentUser && (
//             <>
//               <Text style={styles.userInstructionText}>
//                 Tap to show QR code
//               </Text>
//               <Text style={styles.tapInstructionText}>
//                 ↓ FLIP CARD ↓
//               </Text>
//             </>
//           )}
//         </View>
//       </Animated.View>

//       {/* Back Side - QR Code */}
//       <Animated.View
//         style={[
//           styles.machineCard,
//           styles.cardFace,
//           styles.cardBack,
//           backAnimatedStyle,
//           { opacity: flipAnimation.interpolate({
//             inputRange: [0, 0.5, 1],
//             outputRange: [0, 0, 1]
//           }) }
//         ]}
//       >
//         <Text style={styles.qrTitle}>Show QR to Admin</Text>
//         <View style={styles.qrCodeContainer}>
//           {/* 
//             This is a placeholder for the QR code.
//             In a real app, you would use a QR code library like 'react-native-qrcode-svg'
//             to generate a QR code based on machine.qrCodeValue
//           */}
//           <View style={styles.qrCodePlaceholder}>
//             <Text style={styles.qrPlaceholderText}>QR CODE</Text>
//             <Text style={styles.qrCodeValue}>{machine.qrCodeValue}</Text>
//           </View>
//         </View>
        
//         <Text style={styles.timerText}>
//           {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Time expired'}
//         </Text>
        
//         <TouchableOpacity 
//           style={styles.flipBackButton}
//           onPress={flipCard}
//         >
//           <Text style={styles.flipBackText}>Flip Back</Text>
//         </TouchableOpacity>
//       </Animated.View>
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
//     width: '100%',
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 15,
//     elevation: 3,
//   },
//   flippableCardContainer: {
//     width: '45%',
//     height: 220, // Fixed height for flippable card
//     marginBottom: 15,
//     perspective: 1000, // Required for 3D effect
//   },
//   cardFace: {
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//     backfaceVisibility: 'hidden',
//   },
//   cardBack: {
//     backgroundColor: '#FFF9C4',
//   },
//   bookedMachine: {
//     backgroundColor: '#f0f0f0',
//   },
//   pendingQRMachine: {
//     backgroundColor: '#FFF9C4', // Light yellow for pending QR machines
//   },
//   maintenanceMachine: {
//     backgroundColor: '#FCFAE8',
//   },
//   currentUserMachine: {
//     borderWidth: 2,
//     borderColor: '#3D4EB0',
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
//     width: '100%',
//   },
//   pendingQRInfo: {
//     marginTop: 5,
//     alignItems: 'center',
//   },
//   pendingQRText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#FF8F00',
//   },
//   userInstructionText: {
//     fontSize: 10,
//     color: '#555',
//     marginTop: 8,
//   },
//   tapInstructionText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#3D4EB0',
//     marginTop: 8,
//   },
//   bookedInfo: {
//     marginTop: 5,
//     alignItems: 'center',
//   },
//   timerText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#E53935',
//     marginBottom: 5,
//   },
//   bookedByText: {
//     fontSize: 12,
//     color: '#555',
//   },
//   maintenanceInfo: {
//     marginTop: 5,
//     alignItems: 'center',
//   },
//   maintenanceText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#E53935',
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
//   unbookButton: {
//     marginTop: 8,
//     backgroundColor: '#3D4EB0',
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 5,
//   },
//   unbookButtonText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   qrTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   qrCodeContainer: {
//     width: '100%',
//     aspectRatio: 1,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   qrCodePlaceholder: {
//     width: '80%',
//     height: '80%',
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//   },
//   qrPlaceholderText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   qrCodeValue: {
//     fontSize: 8,
//     color: '#777',
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   flipBackButton: {
//     marginTop: 8,
//     backgroundColor: '#3D4EB0',
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 5,
//   },
//   flipBackText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
// });

// export default MachinePage;


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   Image,
//   Animated,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// const MachinePage = ({ navigation }) => {
//   const [availableMachines, setAvailableMachines] = useState([]);
//   const [pendingQRMachines, setPendingQRMachines] = useState([]);
//   const [bookedMachines, setBookedMachines] = useState([]);
//   const [maintenanceMachines, setMaintenanceMachines] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userHasBooking, setUserHasBooking] = useState(false);
//   const [userHasPendingQR, setUserHasPendingQR] = useState(false);
//   const currentUser = auth().currentUser;

//   useEffect(() => {
//     // Set up real-time listener for machine collection
//     const unsubscribe = firestore()
//       .collection('machines')
//       .onSnapshot(
//         snapshot => {
//           const available = [];
//           const pendingQR = [];
//           const booked = [];
//           const maintenance = [];
//           let hasBooking = false;
//           let hasPendingQR = false;

//           snapshot.forEach(doc => {
//             const data = doc.data();
//             if (data.underMaintenance === true) {
//               maintenance.push({ id: doc.id, ...data });
//             } else if (data.pendingQRScan === true) {
//               // Check if current user has a QR pending
//               if (data.bookedBy === currentUser?.email) {
//                 hasPendingQR = true;
//               }
//               pendingQR.push({ id: doc.id, ...data });
//             } else if (data.inUse === true) {
//               // Check if current user has a booking
//               if (data.bookedBy === currentUser?.email) {
//                 hasBooking = true;
//               }
//               booked.push({ id: doc.id, ...data });
//             } else {
//               available.push({ id: doc.id, ...data });
//             }
//           });

//           // Sort machines by number for consistent display
//           available.sort((a, b) => (a.number || 0) - (b.number || 0));
//           pendingQR.sort((a, b) => (a.number || 0) - (b.number || 0));
//           booked.sort((a, b) => (a.number || 0) - (b.number || 0));
//           maintenance.sort((a, b) => (a.number || 0) - (b.number || 0));

//           setAvailableMachines(available);
//           setPendingQRMachines(pendingQR);
//           setBookedMachines(booked);
//           setMaintenanceMachines(maintenance);
//           setUserHasBooking(hasBooking);
//           setUserHasPendingQR(hasPendingQR);
//           setLoading(false);
//         },
//         error => {
//           console.error('Error listening to machines collection:', error);
//           Alert.alert('Error', 'Failed to load machine data.');
//           setLoading(false);
//         }
//       );

//     // Set up listener for QR scan confirmation
//     const qrScanListener = firestore()
//       .collection('machines')
//       .where('bookedBy', '==', currentUser?.email)
//       .where('pendingQRScan', '==', false)
//       .where('inUse', '==', true)
//       .onSnapshot(snapshot => {
//         const freshlyScannedMachines = snapshot.docChanges().filter(
//           change => change.type === 'modified' || change.type === 'added'
//         );
        
//         if (freshlyScannedMachines.length > 0) {
//           // Find machines that just got their QR scanned
//           const qrJustScanned = freshlyScannedMachines.some(change => {
//             const data = change.doc.data();
//             // Check if this machine was just scanned by comparing timestamps
//             const now = new Date();
//             const bookingTime = data.qrScannedTime ? new Date(data.qrScannedTime) : null;
            
//             // If booking time is within the last 5 seconds, consider it just scanned
//             return bookingTime && (now - bookingTime) / 1000 < 5;
//           });
          
//           if (qrJustScanned) {
//             // Alert user that their time has started
//             Alert.alert('Your Laundry Time Has Started', 'You have 45 minutes to use the machine.');
//           }
//         }
//       });

//     // Clean up the listeners when component unmounts
//     return () => {
//       unsubscribe();
//       qrScanListener();
//     };
//   }, [currentUser]);

//   const handleBookMachine = async (machine) => {
//     try {
//       if (!currentUser) {
//         Alert.alert('Error', 'You must be logged in to book a machine.');
//         return;
//       }

//       // Check if user already has a booking or pending QR
//       if (userHasBooking || userHasPendingQR) {
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

//       // Calculate QR scan expiry time (40 seconds from now)
//       const qrScanExpiryTime = new Date();
//       qrScanExpiryTime.setSeconds(qrScanExpiryTime.getSeconds() + 40);

//       // Generate a unique QR code value
//       const qrCodeValue = `machine-${machine.number}-${Date.now()}-${currentUser.uid.substring(0, 6)}`;

//       const machineRef = firestore().collection('machines').doc(machine.id);
//       await machineRef.update({ 
//         pendingQRScan: true,
//         inUse: false,
//         bookedBy: currentUser.email,
//         bookingTime: firestore.FieldValue.serverTimestamp(),
//         status: 'pending-qr',
//         qrScanExpiryTime: qrScanExpiryTime.toISOString(),
//         userName: userDetails.name || '',
//         userMobile: userDetails.MobileNo || '',
//         autoUnbooked: false,
//         qrCodeValue: qrCodeValue
//       });

//       // Set a timer to auto-release if QR not scanned
//       setTimeout(() => {
//         autoReleaseIfQRNotScanned(machine.id, currentUser.email);
//       }, 40000); // 40 seconds

//       Alert.alert(
//         'Machine Reserved', 
//         `Machine No. ${machine.number} reserved! Please bring your laundry and flip the card to show QR code to admin for scanning. You have 40 seconds.`
//       );
//     } catch (error) {
//       console.error('Error booking machine:', error);
//       Alert.alert('Error', 'Failed to book machine.');
//     }
//   };

//   const autoReleaseIfQRNotScanned = async (machineId, userEmail) => {
//     try {
//       // Check if the machine is still in pendingQRScan state
//       const machineDoc = await firestore().collection('machines').doc(machineId).get();
//       const machineData = machineDoc.data();
      
//       if (!machineData || machineData.pendingQRScan !== true || machineData.bookedBy !== userEmail) {
//         return; // Machine is not in pending QR state or not booked by this user
//       }

//       // Reset machine to available
//       await firestore().collection('machines').doc(machineId).update({
//         pendingQRScan: false,
//         bookedBy: null,
//         status: 'available',
//         qrScanExpiryTime: null,
//         userName: '',
//         userMobile: '',
//         qrCodeValue: null
//       });

//       Alert.alert(
//         'Reservation Expired',
//         'Your reservation has expired because the QR code was not scanned in time.'
//       );

//       console.log(`Machine ${machineId} auto-released due to QR scan timeout`);
//     } catch (error) {
//       console.error('Error auto-releasing machine:', error);
//     }
//   };

//   const handleUnbookMachine = async (machine) => {
//     try {
//       if (!currentUser || machine.bookedBy !== currentUser.email) {
//         Alert.alert('Error', 'You can only unbook your own machines.');
//         return;
//       }

//       await firestore().collection('machines').doc(machine.id).update({
//         inUse: false,
//         bookedBy: null,
//         status: 'available',
//         lastUsedBy: currentUser.email,
//         lastUserName: machine.userName,
//         lastUserMobile: machine.userMobile,
//         lastUsedTime: new Date().toISOString(),
//         expiryTime: null,
//         autoUnbooked: false
//       });

//       Alert.alert('Success', `Machine No. ${machine.number} has been unbooked.`);
//     } catch (error) {
//       console.error('Error unbooking machine:', error);
//       Alert.alert('Error', 'Failed to unbook machine.');
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

//   // Function to render section
//   const renderSection = (title, machines, renderItem, emptyText) => (
//     <View style={styles.section}>
//       <View style={styles.sectionHeader}>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         <View style={styles.countBadge}>
//           <Text style={styles.countText}>{machines.length}</Text>
//         </View>
//       </View>
      
//       {machines.length > 0 ? (
//         <View style={styles.grid}>
//           {machines.map(machine => renderItem(machine))}
//         </View>
//       ) : (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>{emptyText}</Text>
//         </View>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar backgroundColor="#3D4EB0" barStyle="light-content" />
//       <View style={styles.header}>
//         <Text style={styles.heading}>LNMIIT Laundry</Text>
//         <Text style={styles.subheading}>
//           {availableMachines.length} machines available
//         </Text>
//       </View>

//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#3D4EB0" />
//           <Text style={styles.loadingText}>Loading machines...</Text>
//         </View>
//       ) : (
//         <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//           {renderSection(
//             "Available Machines",
//             availableMachines,
//             (machine) => (
//               <MachineCard
//                 key={machine.id}
//                 machine={machine}
//                 onPress={() => handleBookMachine(machine)}
//               />
//             ),
//             "No available machines at the moment"
//           )}

//           {renderSection(
//             "Pending QR Scan",
//             pendingQRMachines,
//             (machine) => (
//               <FlippableMachineCard 
//                 key={machine.id} 
//                 machine={machine} 
//                 pendingQR
//                 getTimeRemaining={getTimeRemaining}
//                 isCurrentUser={machine.bookedBy === currentUser?.email}
//               />
//             ),
//             "No machines awaiting QR scan"
//           )}

//           {renderSection(
//             "In Use",
//             bookedMachines,
//             (machine) => (
//               <MachineCard 
//                 key={machine.id} 
//                 machine={machine} 
//                 booked 
//                 getTimeRemaining={getTimeRemaining}
//                 isCurrentUser={machine.bookedBy === currentUser?.email}
//                 onUnbook={() => handleUnbookMachine(machine)}
//               />
//             ),
//             "No machines currently in use"
//           )}

//           {renderSection(
//             "Maintenance",
//             maintenanceMachines,
//             (machine) => (
//               <MachineCard 
//                 key={machine.id} 
//                 machine={machine} 
//                 maintenance
//                 disabled
//               />
//             ),
//             "No machines under maintenance"
//           )}
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// };

// // Regular Machine Card for available, booked, and maintenance machines
// const MachineCard = ({ 
//   machine, 
//   onPress, 
//   onUnbook,
//   booked, 
//   maintenance, 
//   getTimeRemaining,
//   isCurrentUser,
//   disabled
// }) => {
//   const [timeRemaining, setTimeRemaining] = useState(0);
  
//   useEffect(() => {
//     let timer;
    
//     if (booked && machine.expiryTime) {
//       // Set initial time for usage timer
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

//   // Convert seconds to minutes and seconds display
//   const formatTime = (totalSeconds) => {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };
  
//   // Get card style based on machine status
//   const getCardStyle = () => {
//     let style = [styles.machineCard];
    
//     if (booked) style.push(styles.bookedMachine);
//     if (maintenance) style.push(styles.maintenanceMachine);
//     if (isCurrentUser) style.push(styles.currentUserMachine);
    
//     return style;
//   };
  
//   // Get status icon and color
//   const getStatusIcon = () => {
//     if (maintenance) return { name: 'tools', color: '#E53935', label: 'Maintenance' };
//     if (booked) return { name: 'washing-machine', color: '#FF9800', label: 'In Use' };
//     return { name: 'check-circle-outline', color: '#4CAF50', label: 'Available' };
//   };
  
//   const statusInfo = getStatusIcon();

//   return (
//     <TouchableOpacity
//       style={getCardStyle()}
//       onPress={onPress}
//       disabled={disabled || booked || maintenance}
//       activeOpacity={0.7}
//     >
//       <View style={styles.cardHeader}>
//         <View style={styles.machineNumber}>
//           <Text style={styles.machineNumberText}>{machine.number}</Text>
//         </View>
//         <Icon name={statusInfo.name} size={24} color={statusInfo.color} />
//       </View>
      
//       <View style={styles.cardContent}>
//         <Icon name="washing-machine" size={36} color="#555" />
        
//         <View style={styles.statusContainer}>
//           <Text style={[styles.statusText, { color: statusInfo.color }]}>
//             {statusInfo.label}
//           </Text>
          
//           {booked && machine.expiryTime && (
//             <Text style={styles.timerText}>
//               {timeRemaining > 0 ? `${formatTime(timeRemaining)} remaining` : 'Time expired'}
//             </Text>
//           )}
          
//           {isCurrentUser && booked && onUnbook && (
//             <TouchableOpacity 
//               style={styles.unbookButton}
//               onPress={onUnbook}
//             >
//               <Text style={styles.unbookButtonText}>Unbook</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
      
//       {!booked && !maintenance && machine.lastUsedBy && (
//         <View style={styles.lastUserInfo}>
//           <Text style={styles.lastUserLabel}>Last user:</Text>
//           <Text style={styles.lastUserName}>{machine.lastUserName || 'Unknown'}</Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// };

// // Flippable Card Component for Pending QR Machines
// const FlippableMachineCard = ({ 
//   machine, 
//   pendingQR, 
//   getTimeRemaining,
//   isCurrentUser 
// }) => {
//   const [isFlipped, setIsFlipped] = useState(false);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const flipAnimation = useRef(new Animated.Value(0)).current;
  
//   useEffect(() => {
//     let timer;
    
//     if (pendingQR && machine.qrScanExpiryTime) {
//       // Set initial time for QR scan timer
//       setTimeRemaining(getTimeRemaining(machine.qrScanExpiryTime));
      
//       // Update timer every second
//       timer = setInterval(() => {
//         const remaining = getTimeRemaining(machine.qrScanExpiryTime);
//         setTimeRemaining(remaining);
//         if (remaining <= 0) {
//           clearInterval(timer);
//         }
//       }, 1000);
//     }
    
//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [pendingQR, machine.qrScanExpiryTime, getTimeRemaining]);

//   // Handle card flip
//   const flipCard = () => {
//     if (!isCurrentUser) return; // Only allow current user to flip their card
    
//     Animated.spring(flipAnimation, {
//       toValue: isFlipped ? 0 : 1,
//       friction: 8,
//       tension: 10,
//       useNativeDriver: true,
//     }).start();
    
//     setIsFlipped(!isFlipped);
//   };

//   // Interpolate for front and back animations
//   const frontAnimatedStyle = {
//     transform: [
//       {
//         rotateY: flipAnimation.interpolate({
//           inputRange: [0, 1],
//           outputRange: ['0deg', '180deg'],
//         }),
//       },
//     ],
//   };

//   const backAnimatedStyle = {
//     transform: [
//       {
//         rotateY: flipAnimation.interpolate({
//           inputRange: [0, 1],
//           outputRange: ['180deg', '360deg'],
//         }),
//       },
//     ],
//   };
  
//   const frontOpacityStyle = {
//     opacity: flipAnimation.interpolate({
//       inputRange: [0, 0.5, 1],
//       outputRange: [1, 0, 0]
//     })
//   };
  
//   const backOpacityStyle = { 
//     opacity: flipAnimation.interpolate({
//       inputRange: [0, 0.5, 1],
//       outputRange: [0, 0, 1]
//     })
//   };

//   return (
//     <TouchableOpacity
//       style={[styles.flippableCardContainer, isCurrentUser && styles.currentUserMachine]}
//       onPress={flipCard}
//       activeOpacity={0.9}
//       disabled={!isCurrentUser}
//     >
//       {/* Front Side - Machine Info */}
//       <Animated.View
//         style={[
//           styles.machineCard,
//           styles.pendingQRMachine,
//           styles.cardFace,
//           frontAnimatedStyle,
//           frontOpacityStyle
//         ]}
//       >
//         <View style={styles.cardHeader}>
//           <View style={styles.machineNumber}>
//             <Text style={styles.machineNumberText}>{machine.number}</Text>
//           </View>
//           <Icon name="qrcode-scan" size={24} color="#FF9800" />
//         </View>
        
//         <View style={styles.cardContent}>
//           <Icon name="washing-machine" size={36} color="#555" />
          
//           <View style={styles.statusContainer}>
//             <Text style={[styles.statusText, { color: '#FF9800' }]}>
//               Awaiting QR Scan
//             </Text>
            
//             {machine.qrScanExpiryTime && (
//               <Text style={styles.timerText}>
//                 {timeRemaining > 0 ? `${timeRemaining}s to scan` : 'Scan time expired'}
//               </Text>
//             )}
            
//             {isCurrentUser && (
//               <View style={styles.flipInstructionContainer}>
//                 <Text style={styles.flipInstructionText}>
//                   Tap to show QR code
//                 </Text>
//                 <Icon name="gesture-swipe" size={20} color="#3D4EB0" />
//               </View>
//             )}
//           </View>
//         </View>
//       </Animated.View>

//       {/* Back Side - QR Code */}
//       <Animated.View
//         style={[
//           styles.machineCard,
//           styles.cardFace,
//           styles.cardBack,
//           backAnimatedStyle,
//           backOpacityStyle
//         ]}
//       >
//         <Text style={styles.qrTitle}>Show QR to Admin</Text>
        
//         <View style={styles.qrCodeContainer}>
//           {/* In production, replace with a real QR code component */}
//           <View style={styles.qrCodePlaceholder}>
//             <Icon name="qrcode" size={80} color="#3D4EB0" />
//             <Text style={styles.qrCodeValue}>{machine.qrCodeValue}</Text>
//           </View>
//         </View>
        
//         <Text style={styles.timerText}>
//           {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Time expired'}
//         </Text>
        
//         <TouchableOpacity 
//           style={styles.flipBackButton}
//           onPress={flipCard}
//         >
//           <Text style={styles.flipBackText}>Flip Back</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#3D4EB0',
//   },
//   header: {
//     backgroundColor: '#3D4EB0',
//     padding: 20,
//     paddingBottom: 15,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     marginBottom: 5,
//     elevation: 4,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center',
//   },
//   subheading: {
//     fontSize: 14,
//     color: '#90CAF9',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FB',
//   },
//   contentContainer: {
//     padding: 15,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7FB',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#555',
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   countBadge: {
//     backgroundColor: '#3D4EB0',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     marginLeft: 10,
//   },
//   countText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   emptyContainer: {
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 15,
//     elevation: 1,
//   },
//   emptyText: {
//     color: '#666',
//     fontSize: 14,
//   },
//   machineCard: {
//     width: '48%',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     marginBottom: 10,
//     padding: 12,
//     elevation: 2,
//   },
//   flippableCardContainer: {
//     width: '48%',
//     height: 170,
//     marginBottom: 10,
//     perspective: 1000,
//   },
//   cardFace: {
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//     backfaceVisibility: 'hidden',
//     borderRadius: 12,
//   },
//   cardBack: {
//     backgroundColor: 'white',
//     padding: 12,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   bookedMachine: {
//     backgroundColor: 'white',
//   },
//   pendingQRMachine: {
//     backgroundColor: 'white',
//   },
//   maintenanceMachine: {
//     backgroundColor: 'white',
//   },
//   currentUserMachine: {
//     borderWidth: 2,
//     borderColor: '#3D4EB0',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   machineNumber: {
//     backgroundColor: '#3D4EB0',
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   machineNumberText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   statusContainer: {
//     flex: 1,
//     marginLeft: 8,
//   },
//   statusText: {
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   timerText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#E53935',
//     marginTop: 4,
//   },
//   lastUserInfo: {
//     marginTop: 5,
//     paddingTop: 5,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   lastUserLabel: {
//     fontSize: 10,
//     color: '#666',
//   },
//   lastUserName: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   unbookButton: {
//     marginTop: 8,
//     backgroundColor: '#3D4EB0',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 4,
//     alignSelf: 'flex-start',
//   },
//   unbookButtonText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   flipInstructionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//   },
//   flipInstructionText: {
//     fontSize: 10,
//     color: '#3D4EB0',
//     marginRight: 5,
//   },
//   qrTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   qrCodeContainer: {
//     width: '100%',
//     aspectRatio: 1,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#eee',
//     padding: 10,
//   },
//   qrCodePlaceholder: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   qrCodeValue: {
//     fontSize: 8,
//     color: '#777',
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   flipBackButton: {
//     backgroundColor: '#3D4EB0',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 4,
//     marginTop: 5,
//   },
//   flipBackText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   }
// });

// export default MachinePage;


import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MachinePage = ({ navigation }) => {
  const [availableMachines, setAvailableMachines] = useState([]);
  const [pendingOTPMachines, setPendingOTPMachines] = useState([]);
  const [bookedMachines, setBookedMachines] = useState([]);
  const [maintenanceMachines, setMaintenanceMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userHasBooking, setUserHasBooking] = useState(false);
  const [userHasPendingOTP, setUserHasPendingOTP] = useState(false);
  const currentUser = auth().currentUser;

  useEffect(() => {
    // Set up real-time listener for machine collection
    const unsubscribe = firestore()
      .collection('machines')
      .onSnapshot(
        snapshot => {
          const available = [];
          const pendingOTP = [];
          const booked = [];
          const maintenance = [];
          let hasBooking = false;
          let hasPendingOTP = false;

          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.underMaintenance === true) {
              maintenance.push({ id: doc.id, ...data });
            } else if (data.pendingOTPVerification === true) {
              // Check if current user has a pending OTP
              if (data.bookedBy === currentUser?.email) {
                hasPendingOTP = true;
              }
              pendingOTP.push({ id: doc.id, ...data });
            } else if (data.inUse === true) {
              // Check if current user has a booking
              if (data.bookedBy === currentUser?.email) {
                hasBooking = true;
              }
              booked.push({ id: doc.id, ...data });
            } else {
              available.push({ id: doc.id, ...data });
            }
          });

          // Sort machines by number for consistent display
          available.sort((a, b) => (a.number || 0) - (b.number || 0));
          pendingOTP.sort((a, b) => (a.number || 0) - (b.number || 0));
          booked.sort((a, b) => (a.number || 0) - (b.number || 0));
          maintenance.sort((a, b) => (a.number || 0) - (b.number || 0));

          setAvailableMachines(available);
          setPendingOTPMachines(pendingOTP);
          setBookedMachines(booked);
          setMaintenanceMachines(maintenance);
          setUserHasBooking(hasBooking);
          setUserHasPendingOTP(hasPendingOTP);
          setLoading(false);
        },
        error => {
          console.error('Error listening to machines collection:', error);
          Alert.alert('Error', 'Failed to load machine data.');
          setLoading(false);
        }
      );

    // Set up listener for OTP verification confirmation
    const otpVerificationListener = firestore()
      .collection('machines')
      .where('bookedBy', '==', currentUser?.email)
      .where('pendingOTPVerification', '==', false)
      .where('inUse', '==', true)
      .onSnapshot(snapshot => {
        const freshlyVerifiedMachines = snapshot.docChanges().filter(
          change => change.type === 'modified' || change.type === 'added'
        );
        
        if (freshlyVerifiedMachines.length > 0) {
          // Find machines that just got their OTP verified
          const otpJustVerified = freshlyVerifiedMachines.some(change => {
            const data = change.doc.data();
            // Check if this machine was just verified by comparing timestamps
            const now = new Date();
            const bookingTime = data.otpVerifiedTime ? new Date(data.otpVerifiedTime) : null;
            
            // If booking time is within the last 5 seconds, consider it just verified
            return bookingTime && (now - bookingTime) / 1000 < 5;
          });
          
          if (otpJustVerified) {
            // Alert user that their time has started
            Alert.alert('Your Laundry Time Has Started', 'You have 60 seconds to use the machine.');
          }
        }
      });

    // Clean up the listeners when component unmounts
    return () => {
      unsubscribe();
      otpVerificationListener();
    };
  }, [currentUser]);

  const handleBookMachine = async (machine) => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to book a machine.');
        return;
      }

      // Check if user already has a booking or pending OTP
      if (userHasBooking || userHasPendingOTP) {
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

      // Calculate OTP verification expiry time (40 seconds from now)
      const otpVerifyExpiryTime = new Date();
      otpVerifyExpiryTime.setSeconds(otpVerifyExpiryTime.getSeconds() + 60);

      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const machineRef = firestore().collection('machines').doc(machine.id);
      await machineRef.update({ 
        pendingOTPVerification: true,
        inUse: false,
        bookedBy: currentUser.email,
        bookingTime: firestore.FieldValue.serverTimestamp(),
        status: 'pending-otp',
        otpVerifyExpiryTime: otpVerifyExpiryTime.toISOString(),
        userName: userDetails.name || '',
        userMobile: userDetails.MobileNo || '',
        autoUnbooked: false,
        otp: otp
      });

      // Set a timer to auto-release if OTP not verified
      setTimeout(() => {
        autoReleaseIfOTPNotVerified(machine.id, currentUser.email);
      }, 60000); // 40 seconds

      Alert.alert(
        'Machine Reserved', 
        `Machine No. ${machine.number} reserved! Please bring your laundry and verify OTP ${otp} with admin. You have 40 seconds.`
      );
    } catch (error) {
      console.error('Error booking machine:', error);
      Alert.alert('Error', 'Failed to book machine.');
    }
  };

  const autoReleaseIfOTPNotVerified = async (machineId, userEmail) => {
    try {
      // Check if the machine is still in pendingOTPVerification state
      const machineDoc = await firestore().collection('machines').doc(machineId).get();
      const machineData = machineDoc.data();
      
      if (!machineData || machineData.pendingOTPVerification !== true || machineData.bookedBy !== userEmail) {
        return; // Machine is not in pending OTP state or not booked by this user
      }

      // Reset machine to available
      await firestore().collection('machines').doc(machineId).update({
        pendingOTPVerification: false,
        bookedBy: null,
        status: 'available',
        otpVerifyExpiryTime: null,
        userName: '',
        userMobile: '',
        otp: null
      });

      Alert.alert(
        'Reservation Expired',
        'Your reservation has expired because the OTP was not verified in time.'
      );

      console.log(`Machine ${machineId} auto-released due to OTP verification timeout`);
    } catch (error) {
      console.error('Error auto-releasing machine:', error);
    }
  };

  const handleUnbookMachine = async (machine) => {
    try {
      if (!currentUser || machine.bookedBy !== currentUser.email) {
        Alert.alert('Error', 'You can only unbook your own machines.');
        return;
      }

      await firestore().collection('machines').doc(machine.id).update({
        inUse: false,
        bookedBy: null,
        status: 'available',
        lastUsedBy: currentUser.email,
        lastUserName: machine.userName,
        lastUserMobile: machine.userMobile,
        lastUsedTime: new Date().toISOString(),
        expiryTime: null,
        autoUnbooked: false
      });

      Alert.alert('Success', `Machine No. ${machine.number} has been unbooked.`);
    } catch (error) {
      console.error('Error unbooking machine:', error);
      Alert.alert('Error', 'Failed to unbook machine.');
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

  // Function to render section
  const renderSection = (title, machines, renderItem, emptyText) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{machines.length}</Text>
        </View>
      </View>
      
      {machines.length > 0 ? (
        <View style={styles.grid}>
          {machines.map(machine => renderItem(machine))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3D4EB0" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.heading}>LNMIIT Laundry</Text>
        <Text style={styles.subheading}>
          {availableMachines.length} machines available
        </Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3D4EB0" />
          <Text style={styles.loadingText}>Loading machines...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {renderSection(
            "Available Machines",
            availableMachines,
            (machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onPress={() => handleBookMachine(machine)}
              />
            ),
            "No available machines at the moment"
          )}

          {renderSection(
            "Pending OTP Verification",
            pendingOTPMachines,
            (machine) => (
              <OTPMachineCard 
                key={machine.id} 
                machine={machine} 
                pendingOTP
                getTimeRemaining={getTimeRemaining}
                isCurrentUser={machine.bookedBy === currentUser?.email}
              />
            ),
            "No machines awaiting OTP verification"
          )}

          {renderSection(
            "In Use",
            bookedMachines,
            (machine) => (
              <MachineCard 
                key={machine.id} 
                machine={machine} 
                booked 
                getTimeRemaining={getTimeRemaining}
                isCurrentUser={machine.bookedBy === currentUser?.email}
                onUnbook={() => handleUnbookMachine(machine)}
              />
            ),
            "No machines currently in use"
          )}

          {renderSection(
            "Maintenance",
            maintenanceMachines,
            (machine) => (
              <MachineCard 
                key={machine.id} 
                machine={machine} 
                maintenance
                disabled
              />
            ),
            "No machines under maintenance"
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Regular Machine Card for available, booked, and maintenance machines
const MachineCard = ({ 
  machine, 
  onPress, 
  onUnbook,
  booked, 
  maintenance, 
  getTimeRemaining,
  isCurrentUser,
  disabled
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  useEffect(() => {
    let timer;
    
    if (booked && machine.expiryTime) {
      // Set initial time for usage timer
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

  // Convert seconds to minutes and seconds display
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Get card style based on machine status
  const getCardStyle = () => {
    let style = [styles.machineCard];
    
    if (booked) style.push(styles.bookedMachine);
    if (maintenance) style.push(styles.maintenanceMachine);
    if (isCurrentUser) style.push(styles.currentUserMachine);
    
    return style;
  };
  
  // Get status icon and color
  const getStatusIcon = () => {
    if (maintenance) return { name: 'tools', color: '#E53935', label: 'Maintenance' };
    if (booked) return { name: 'washing-machine', color: '#FF9800', label: 'In Use' };
    return { name: 'check-circle-outline', color: '#4CAF50', label: 'Available' };
  };
  
  const statusInfo = getStatusIcon();

  return (
    <TouchableOpacity
      style={getCardStyle()}
      onPress={onPress}
      disabled={disabled || booked || maintenance}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.machineNumber}>
          <Text style={styles.machineNumberText}>{machine.number}</Text>
        </View>
        <Icon name={statusInfo.name} size={24} color={statusInfo.color} />
      </View>
      
      <View style={styles.cardContent}>
        <Icon name="washing-machine" size={36} color="#555" />
        
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
          
          {booked && machine.expiryTime && (
            <Text style={styles.timerText}>
              {timeRemaining > 0 ? `${formatTime(timeRemaining)} remaining` : 'Time expired'}
            </Text>
          )}
          
          {isCurrentUser && booked && onUnbook && (
            <TouchableOpacity 
              style={styles.unbookButton}
              onPress={onUnbook}
            >
              <Text style={styles.unbookButtonText}>Unbook</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {!booked && !maintenance && machine.lastUsedBy && (
        <View style={styles.lastUserInfo}>
          <Text style={styles.lastUserLabel}>Last user:</Text>
          <Text style={styles.lastUserName}>{machine.lastUserName || 'Unknown'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// OTP Card Component for Pending OTP Machines
const OTPMachineCard = ({ 
  machine, 
  pendingOTP, 
  getTimeRemaining,
  isCurrentUser 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  useEffect(() => {
    let timer;
    
    if (pendingOTP && machine.otpVerifyExpiryTime) {
      // Set initial time for OTP verification timer
      setTimeRemaining(getTimeRemaining(machine.otpVerifyExpiryTime));
      
      // Update timer every second
      timer = setInterval(() => {
        const remaining = getTimeRemaining(machine.otpVerifyExpiryTime);
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [pendingOTP, machine.otpVerifyExpiryTime, getTimeRemaining]);

  return (
    <View
      style={[styles.machineCard, styles.pendingOTPMachine, isCurrentUser && styles.currentUserMachine]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.machineNumber}>
          <Text style={styles.machineNumberText}>{machine.number}</Text>
        </View>
        <Icon name="key-variant" size={24} color="#FF9800" />
      </View>
      
      <View style={styles.cardContent}>
        <Icon name="washing-machine" size={36} color="#555" />
        
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: '#FF9800' }]}>
            Awaiting OTP Verification
          </Text>
          
          {machine.otpVerifyExpiryTime && (
            <Text style={styles.timerText}>
              {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Time expired'}
            </Text>
          )}
          
          {isCurrentUser && (
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Your OTP:</Text>
              <Text style={styles.otpValue}>{machine.otp}</Text>
              <Text style={styles.otpInstructions}>
                Show this OTP to admin
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3D4EB0',
  },
  header: {
    backgroundColor: '#3D4EB0',
    padding: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 5,
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#90CAF9',
    textAlign: 'center',
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  contentContainer: {
    padding: 15,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  countBadge: {
    backgroundColor: '#3D4EB0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 1,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  machineCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    padding: 12,
    elevation: 2,
    minHeight: 150,
  },
  bookedMachine: {
    backgroundColor: 'white',
  },
  pendingOTPMachine: {
    backgroundColor: 'white',
  },
  maintenanceMachine: {
    backgroundColor: 'white',
  },
  currentUserMachine: {
    borderWidth: 2,
    borderColor: '#3D4EB0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  machineNumber: {
    backgroundColor: '#3D4EB0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  machineNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flex: 1,
    marginLeft: 8,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E53935',
    marginTop: 4,
  },
  lastUserInfo: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  lastUserLabel: {
    fontSize: 10,
    color: '#666',
  },
  lastUserName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  unbookButton: {
    marginTop: 8,
    backgroundColor: '#3D4EB0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  unbookButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  otpContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F0F4FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3D4EB0',
  },
  otpLabel: {
    fontSize: 10,
    color: '#3D4EB0',
  },
  otpValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D4EB0',
    letterSpacing: 1,
    marginVertical: 4,
  },
  otpInstructions: {
    fontSize: 9,
    color: '#555',
    fontStyle: 'italic',
  }
});

export default MachinePage;