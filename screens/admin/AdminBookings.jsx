

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   Image,
// } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';

// const AdminBookings = () => {
//   const [machines, setMachines] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is admin
//     checkAdminPermission();
    
//     // Fetch machines with real-time updates
//     const unsubscribe = setupMachinesListener();
    
//     return () => unsubscribe();
//   }, []);

//   const checkAdminPermission = async () => {
//     const currentUser = auth().currentUser;
//     if (!currentUser) {
//       Alert.alert('Error', 'You must be logged in to access this page.');
//       // Navigate back or to login
//       return;
//     }

//     try {
//       const adminSnapshot = await firestore()
//         .collection('admins')
//         .where('email', '==', currentUser.email)
//         .get();

//       if (adminSnapshot.empty) {
//         Alert.alert('Access Denied', 'You do not have admin privileges.');
//         // Navigate back
//         return;
//       }
//     } catch (error) {
//       console.error('Error checking admin status:', error);
//       Alert.alert('Error', 'Failed to verify admin privileges.');
//     }
//   };

//   const setupMachinesListener = () => {
//     return firestore()
//       .collection('machines')
//       .onSnapshot(async (snapshot) => {
//         try {
//           const machinesData = [];
          
//           // Process each machine
//           for (const doc of snapshot.docs) {
//             const machineData = {
//               id: doc.id,
//               ...doc.data(),
//               lastUses: [] // Initialize lastUses array
//             };
            
//             // Get the last 3 uses for this machine
//             const usesSnapshot = await firestore()
//               .collection('machines')
//               .doc(doc.id)
//               .collection('usageHistory')
//               .orderBy('timestamp', 'desc')
//               .limit(3)
//               .get();
            
//             // Add usage data to the machine
//             if (!usesSnapshot.empty) {
//               machineData.lastUses = usesSnapshot.docs.map(useDoc => ({
//                 id: useDoc.id,
//                 ...useDoc.data()
//               }));
//             }
            
//             machinesData.push(machineData);
//           }
          
//           // Sort machines by number
//           machinesData.sort((a, b) => (a.number || 0) - (b.number || 0));
//           setMachines(machinesData);
//           setLoading(false);
//         } catch (error) {
//           console.error('Error processing machines data:', error);
//           Alert.alert('Error', 'Failed to load machine data: ' + error.message);
//           setLoading(false);
//         }
//       }, (error) => {
//         console.error('Error setting up machine listener:', error);
//         Alert.alert('Error', 'Failed to connect to database: ' + error.message);
//         setLoading(false);
//       });
//   };

//   const formatDate = (timestamp) => {
//     if (!timestamp) return 'N/A';
    
//     // If it's a Firebase timestamp
//     if (timestamp.toDate) {
//       timestamp = timestamp.toDate();
//     } 
//     // If it's an ISO string
//     else if (typeof timestamp === 'string') {
//       timestamp = new Date(timestamp);
//     }
    
//     return timestamp.toLocaleString('en-US', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//       hour: 'numeric',
//       minute: 'numeric',
//       hour12: true
//     });
//   };

//   const getStatusStyle = (machine) => {
//     if (machine.underMaintenance) {
//       return { style: styles.maintenanceStatus, text: 'Under Maintenance' };
//     } else if (machine.inUse) {
//       return { style: styles.inUseStatus, text: 'In Use' };
//     } else {
//       return { style: styles.availableStatus, text: 'Available' };
//     }
//   };

//   const renderMachine = ({ item }) => {
//     const statusInfo = getStatusStyle(item);
    
//     return (
//       <View style={styles.machineContainer}>
//         <View style={styles.machineHeader}>
//           <Text style={styles.machineTitle}>Machine No. {item.number}</Text>
//           <Text style={[styles.machineStatus, statusInfo.style]}>
//             {statusInfo.text}
//           </Text>
//         </View>
        
//         <View style={styles.machineDetails}>
//           <Text style={styles.sectionTitle}>Last 3 Usage Logs:</Text>
          
//           {item.lastUses && item.lastUses.length > 0 ? (
//             item.lastUses.map((use, index) => (
//               <View key={use.id || index} style={styles.logItem}>
//                 <View style={styles.logHeader}>
//                   <Text style={styles.logHeaderText}>Log #{index + 1}</Text>
//                   <Text style={styles.logTime}>{formatDate(use.timestamp)}</Text>
//                 </View>
//                 <View style={styles.logContent}>
//                   <View style={styles.userIconContainer}>
//                     <Image
//                       source={require('../../assets/image.png')}
//                       style={styles.userIcon}
//                     />
//                   </View>
//                   <View style={styles.userDetails}>
//                     <Text style={styles.userName}>{use.userName || 'Unknown User'}</Text>
//                     <Text style={styles.userInfo}>Email: {use.userEmail || 'N/A'}</Text>
//                     <Text style={styles.userInfo}>Mobile: {use.userMobile || 'N/A'}</Text>
//                     {use.autoUnbooked && (
//                       <Text style={styles.autoUnbooked}>Auto-unbooked</Text>
//                     )}
//                   </View>
//                 </View>
//               </View>
//             ))
//           ) : (
//             <Text style={styles.noLogsText}>No usage logs available</Text>
//           )}
//         </View>
        
//         <View style={styles.currentInfoSection}>
//           <Text style={styles.sectionTitle}>Current Status:</Text>
//           {item.inUse ? (
//             <>
//               <Text style={styles.infoText}>
//                 <Text style={styles.infoLabel}>Current User: </Text>
//                 {item.userName || 'Unknown'}
//               </Text>
//               <Text style={styles.infoText}>
//                 <Text style={styles.infoLabel}>Email: </Text>
//                 {item.bookedBy || 'N/A'}
//               </Text>
//               <Text style={styles.infoText}>
//                 <Text style={styles.infoLabel}>Mobile: </Text>
//                 {item.userMobile || 'N/A'}
//               </Text>
//               {item.bookingTime && (
//                 <Text style={styles.infoText}>
//                   <Text style={styles.infoLabel}>Booked At: </Text>
//                   {formatDate(item.bookingTime)}
//                 </Text>
//               )}
//               {item.expiryTime && (
//                 <Text style={styles.infoText}>
//                   <Text style={styles.infoLabel}>Expires At: </Text>
//                   {formatDate(item.expiryTime)}
//                 </Text>
//               )}
//             </>
//           ) : (
//             <>
//               <Text style={styles.infoText}>
//                 <Text style={styles.infoLabel}>Status: </Text>
//                 {item.underMaintenance ? 'Under Maintenance' : 'Available'}
//               </Text>
//               <Text style={styles.infoText}>
//                 <Text style={styles.infoLabel}>Last User: </Text>
//                 {item.lastUserName || 'None'}
//               </Text>
//               <Text style={styles.infoText}>
//                 <Text style={styles.infoLabel}>Last Used: </Text>
//                 {item.lastUsedTime ? formatDate(item.lastUsedTime) : 'Never'}
//               </Text>
//             </>
//           )}
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#3D4EB0" />
//         <Text style={styles.loadingText}>Loading machine data...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Admin Bookings Dashboard</Text>
//       <Text style={styles.subheading}>Machine Usage Logs</Text>
      
//       <TouchableOpacity 
//         style={styles.refreshButton}
//         onPress={() => {
//           setLoading(true);
//           setupMachinesListener();
//         }}
//       >
//         <Text style={styles.refreshButtonText}>Refresh Data</Text>
//       </TouchableOpacity>
      
//       <FlatList
//         data={machines}
//         renderItem={renderMachine}
//         keyExtractor={item => item.id}
//         contentContainerStyle={styles.listContainer}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     padding: 16,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#3D4EB0',
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 5,
//   },
//   subheading: {
//     fontSize: 16,
//     color: '#3D4EB0',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   refreshButton: {
//     backgroundColor: '#3D4EB0',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: 'center',
//   },
//   refreshButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
//   machineContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   machineHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 12,
//   },
//   machineTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   machineStatus: {
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   availableStatus: {
//     backgroundColor: '#E8F5E9',
//     color: '#2E7D32',
//   },
//   inUseStatus: {
//     backgroundColor: '#E3F2FD',
//     color: '#1565C0',
//   },
//   maintenanceStatus: {
//     backgroundColor: '#FFF0E8',
//     color: '#FF6B35',
//   },
//   machineDetails: {
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     color: '#333',
//   },
//   logItem: {
//     backgroundColor: '#f9f9f9',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     elevation: 1,
//   },
//   logHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 6,
//   },
//   logHeaderText: {
//     fontWeight: 'bold',
//     color: '#3D4EB0',
//     fontSize: 15,
//   },
//   logTime: {
//     color: '#666',
//     fontSize: 13,
//   },
//   logContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   userIconContainer: {
//     backgroundColor: '#EBEEFF',
//     borderRadius: 8,
//     padding: 8,
//     marginRight: 12,
//   },
//   userIcon: {
//     width: 30,
//     height: 30,
//   },
//   userDetails: {
//     flex: 1,
//   },
//   userName: {
//     fontWeight: 'bold',
//     fontSize: 15,
//     marginBottom: 4,
//   },
//   userInfo: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 2,
//   },
//   autoUnbooked: {
//     fontSize: 13,
//     color: '#E53935',
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
//   noLogsText: {
//     fontStyle: 'italic',
//     color: '#999',
//     textAlign: 'center',
//     paddingVertical: 16,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//   },
//   currentInfoSection: {
//     backgroundColor: '#f3f3f3',
//     padding: 14,
//     borderRadius: 8,
//   },
//   infoText: {
//     fontSize: 14,
//     marginBottom: 6,
//     color: '#333',
//   },
//   infoLabel: {
//     fontWeight: 'bold',
//     color: '#555',
//   },
// });

// export default AdminBookings;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const AdminBookings = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    // Check if user is admin
    checkAdminPermission();
    
    // Fetch machines with real-time updates
    const unsubscribe = setupMachinesListener();
    
    return () => unsubscribe();
  }, []);

  const checkAdminPermission = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to access this page.');
      // Navigate back or to login
      return;
    }

    try {
      const adminSnapshot = await firestore()
        .collection('admins')
        .where('email', '==', currentUser.email)
        .get();

      if (adminSnapshot.empty) {
        Alert.alert('Access Denied', 'You do not have admin privileges.');
        // Navigate back
        return;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      Alert.alert('Error', 'Failed to verify admin privileges.');
    }
  };

  const migrateUsageHistoryToSubcollection = async () => {
    try {
      setMigrating(true);
      const machinesSnapshot = await firestore().collection('machines').get();
      
      for (const machineDoc of machinesSnapshot.docs) {
        const machineData = machineDoc.data();
        
        // If the machine has usage history as an array
        if (machineData.usageHistory && Array.isArray(machineData.usageHistory)) {
          // Create a batch for efficient writes
          const batch = firestore().batch();
          
          // Add each usage record to the subcollection
          for (const usage of machineData.usageHistory) {
            const newDocRef = firestore()
              .collection('machines')
              .doc(machineDoc.id)
              .collection('usageHistory')
              .doc(); // Auto-generate ID
              
            batch.set(newDocRef, {
              ...usage,
              // Ensure timestamp is properly stored
              timestamp: usage.timestamp || firestore.Timestamp.now()
            });
          }
          
          // Commit all the writes
          await batch.commit();
          console.log(`Migrated ${machineData.usageHistory.length} records for machine ${machineDoc.id}`);
        }
      }
      
      Alert.alert('Success', 'Usage history migration completed successfully.');
    } catch (error) {
      console.error('Migration error:', error);
      Alert.alert('Error', 'Failed to migrate usage history: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };

  const setupMachinesListener = () => {
    return firestore()
      .collection('machines')
      .onSnapshot(async (snapshot) => {
        try {
          const machinesData = [];
          
          // Process each machine
          for (const doc of snapshot.docs) {
            const machineData = {
              id: doc.id,
              ...doc.data(),
              lastUses: [] // Initialize lastUses array
            };
            
            // Try to get usageHistory from subcollection first (recommended approach)
            try {
              const usageHistorySnapshot = await firestore()
                .collection('machines')
                .doc(doc.id)
                .collection('usageHistory')
                .orderBy('timestamp', 'desc')
                .limit(3)
                .get();
              
              if (!usageHistorySnapshot.empty) {
                machineData.lastUses = usageHistorySnapshot.docs.map(useDoc => ({
                  id: useDoc.id,
                  ...useDoc.data()
                }));
              }
              // If subcollection query returned no data, check if usageHistory is an array field
              else {
                // Fallback to using the array field if it exists
                if (machineData.usageHistory && Array.isArray(machineData.usageHistory)) {
                  machineData.lastUses = machineData.usageHistory
                    .sort((a, b) => {
                      const timeA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
                      const timeB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
                      return timeB - timeA;
                    })
                    .slice(0, 3)
                    .map((use, index) => ({
                      id: index.toString(),
                      ...use
                    }));
                }
              }
            } catch (error) {
              console.error(`Error retrieving usageHistory for machine ${doc.id}:`, error);
            }
            
            machinesData.push(machineData);
          }
          
          // Sort machines by number
          machinesData.sort((a, b) => (a.number || 0) - (b.number || 0));
          setMachines(machinesData);
          setLoading(false);
        } catch (error) {
          console.error('Error processing machines data:', error);
          Alert.alert('Error', 'Failed to load machine data: ' + error.message);
          setLoading(false);
        }
      }, (error) => {
        console.error('Error setting up machine listener:', error);
        Alert.alert('Error', 'Failed to connect to database: ' + error.message);
        setLoading(false);
      });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // If it's a Firebase timestamp
    if (timestamp.toDate) {
      timestamp = timestamp.toDate();
    } 
    // If it's an ISO string
    else if (typeof timestamp === 'string') {
      timestamp = new Date(timestamp);
    }
    
    return timestamp.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const getStatusStyle = (machine) => {
    if (machine.underMaintenance) {
      return { style: styles.maintenanceStatus, text: 'Under Maintenance' };
    } else if (machine.inUse) {
      return { style: styles.inUseStatus, text: 'In Use' };
    } else {
      return { style: styles.availableStatus, text: 'Available' };
    }
  };

  const renderMachine = ({ item }) => {
    const statusInfo = getStatusStyle(item);
    
    return (
      <View style={styles.machineContainer}>
        <View style={styles.machineHeader}>
          <Text style={styles.machineTitle}>Machine No. {item.number}</Text>
          <Text style={[styles.machineStatus, statusInfo.style]}>
            {statusInfo.text}
          </Text>
        </View>
        
        <View style={styles.machineDetails}>
          <Text style={styles.sectionTitle}>Last 3 Usage Logs:</Text>
          
          {item.lastUses && item.lastUses.length > 0 ? (
            item.lastUses.map((use, index) => (
              <View key={use.id || index} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logHeaderText}>Log #{index + 1}</Text>
                  <Text style={styles.logTime}>{formatDate(use.timestamp)}</Text>
                </View>
                <View style={styles.logContent}>
                  <View style={styles.userIconContainer}>
                    <Image
                      source={require('../../assets/image.png')}
                      style={styles.userIcon}
                    />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{use.userName || 'Unknown User'}</Text>
                    <Text style={styles.userInfo}>Email: {use.userEmail || 'N/A'}</Text>
                    <Text style={styles.userInfo}>Mobile: {use.userMobile || 'N/A'}</Text>
                    {use.autoUnbooked && (
                      <Text style={styles.autoUnbooked}>Auto-unbooked</Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noLogsText}>No usage logs available</Text>
          )}
        </View>
        
        <View style={styles.currentInfoSection}>
          <Text style={styles.sectionTitle}>Current Status:</Text>
          {item.inUse ? (
            <>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Current User: </Text>
                {item.userName || 'Unknown'}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Email: </Text>
                {item.bookedBy || 'N/A'}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Mobile: </Text>
                {item.userMobile || 'N/A'}
              </Text>
              {item.bookingTime && (
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Booked At: </Text>
                  {formatDate(item.bookingTime)}
                </Text>
              )}
              {item.expiryTime && (
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Expires At: </Text>
                  {formatDate(item.expiryTime)}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Status: </Text>
                {item.underMaintenance ? 'Under Maintenance' : 'Available'}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Last User: </Text>
                {item.lastUserName || 'None'}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Last Used: </Text>
                {item.lastUsedTime ? formatDate(item.lastUsedTime) : 'Never'}
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3D4EB0" />
        <Text style={styles.loadingText}>Loading machine data...</Text>
      </View>
    );
  }

  if (migrating) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Migrating usage history data...</Text>
        <Text style={styles.migrationText}>This may take a few moments</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Bookings Dashboard</Text>
      <Text style={styles.subheading}>Machine Usage Logs</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            setLoading(true);
            setupMachinesListener();
          }}
        >
          <Text style={styles.refreshButtonText}>Refresh Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.migrateButton}
          onPress={() => {
            Alert.alert(
              'Migrate Usage History',
              'This will move usage history from array fields to subcollections. Run this only once. Continue?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Migrate', onPress: migrateUsageHistoryToSubcollection }
              ]
            );
          }}
        >
          <Text style={styles.refreshButtonText}>Migrate History Data</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={machines}
        renderItem={renderMachine}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3D4EB0',
  },
  migrationText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subheading: {
    fontSize: 16,
    color: '#3D4EB0',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#3D4EB0',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  migrateButton: {
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  machineContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  machineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  machineStatus: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: 14,
  },
  availableStatus: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  inUseStatus: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
  },
  maintenanceStatus: {
    backgroundColor: '#FFF0E8',
    color: '#FF6B35',
  },
  machineDetails: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  logItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  logHeaderText: {
    fontWeight: 'bold',
    color: '#3D4EB0',
    fontSize: 15,
  },
  logTime: {
    color: '#666',
    fontSize: 13,
  },
  logContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIconContainer: {
    backgroundColor: '#EBEEFF',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  userIcon: {
    width: 30,
    height: 30,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  autoUnbooked: {
    fontSize: 13,
    color: '#E53935',
    marginTop: 4,
    fontStyle: 'italic',
  },
  noLogsText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  currentInfoSection: {
    backgroundColor: '#f3f3f3',
    padding: 14,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
});

export default AdminBookings;