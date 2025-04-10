import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Switch, TouchableOpacity } from 'react-native';

const AddMachineModal = ({ 
  visible, 
  onClose, 
  machineNumber, 
  setMachineNumber, 
  underMaintenance, 
  setUnderMaintenance, 
  onSubmit 
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Machine</Text>

          <TextInput
            style={styles.input}
            placeholder="Machine Number"
            value={machineNumber}
            onChangeText={setMachineNumber}
            keyboardType="numeric"
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Under Maintenance:</Text>
            <Switch
              value={underMaintenance}
              onValueChange={setUnderMaintenance}
              trackColor={{false: '#767577', true: '#E53935'}}
              thumbColor={underMaintenance ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={onSubmit}>
              <Text style={styles.buttonText}>Add Machine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  submitButton: {
    backgroundColor: '#3D4EB0',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddMachineModal;