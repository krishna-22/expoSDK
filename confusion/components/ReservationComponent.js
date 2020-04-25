import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Picker, Switch, Button, Modal, Alert, Platform } from 'react-native';
import DatePicker from 'react-native-datepicker'
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import * as Calendar from 'expo-calendar'

class Reservation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      guests: 1,
      smoking: false,
      date: '',
      showModal: false //this is required in the state by the modal in order to show it 
    }
  }

  componentDidMount() {
    //we need to create local android object here for sound and vibration
    Notifications.createChannelAndroidAsync('notification', {
      name: 'notification',
      sound: true,
      vibrate: true,
    })

  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  smokingDisplay(smoking) {
    return smoking ? 'Yes' : 'No';
  }

  //will ask for permission to access the calendar on the device.
  obtainCalendarPermission = async () => {
    //getting the permission
    const calenderPermission = await Permissions.askAsync(Permissions.CALENDAR);
    if (calenderPermission === 'granted') {
      return true
    }
    else return false
  }


  addReservationToCalendar = async (date) => {
    if (this.obtainCalendarPermission()) {
      //getting the default calender
      let defaultCalendar;
      let event_date = new Date(Date.parse(date))
      //intializing the event details
      const eventDetails = {
        title: 'Con Fusion Table Reservation',
        startDate: event_date,
        endDate: new Date(Date.parse(date) + 2 * 60 * 60 * 1000),
        timeZone: 'Asia/Hong_Kong',
        location: '121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong'
      }
      if (Platform.OS === 'ios') { //checking for the platform
        defaultCalendar = await this.getDefaultCalendarSource()
      }
      else if (Platform.OS === 'android') {
        const calendars = await Calendar.getCalendarsAsync();
        const defaultCalendarSource = {
          isLocalAccount: true, name: 'Default', //setting the source name as default
        }
        const defaultCalendars = calendars.filter(each =>
          each.source.name === 'Default' //checking whether any already default calender exists
        );
        if (defaultCalendars.length === 0) { //if there is no default calendar
          const newCalendar = await Calendar.createCalendarAsync({
            title: 'Expo Calendar',
            color: 'blue',
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendarSource.id,
            source: defaultCalendarSource,
            name: 'internalCalendarName',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
          });

          defaultCalendar = newCalendar //set the default calender as the new calendar
        }
        else {
          defaultCalendar = defaultCalendars[0]
        }
      }
      await Calendar.createEventAsync(defaultCalendar.id, eventDetails) //create an event
    }
    else {
      Alert.alert('Permission not granted to show notifications');
    }
  }

  handleReservation() {
    console.log(JSON.stringify(this.state));
    Alert.alert(
      'Your Reservation OK?',
      'Number of Guests: ' + this.state.guests + '\nSmoking? ' + this.smokingDisplay(this.state.smoking) + '\nDate and Time: ' + this.state.date,
      [
        { text: 'Cancel', onPress: () => this.resetForm() },
        {
          text: 'OK', onPress: () => {
            this.presentLocalNotification(this.state.date)
            this.resetForm()
          }
        },
      ],
      { cancelable: false }
    );

    this.addReservationToCalendar(this.state.date)
  }

  resetForm() {
    this.setState({
      guests: 1,
      smoking: false,
      date: '',
      showModal: false
    });
  }

  async obtainNotificationPermission() {
    let permission = await Permissions.getAsync(Permissions
      .USER_FACING_NOTIFICATIONS);
    if (permission.status !== 'granted') {
      permission = await Permissions.askAsync(Permissions
        .USER_FACING_NOTIFICATIONS);
      if (permission.status !== 'granted') {
        Alert.alert('Permission not granted to show notifications');
      }
    }
    return permission;
  }

  async presentLocalNotification(date) {
    await this.obtainNotificationPermission();
    Notifications.presentLocalNotificationAsync({
      title: 'Your Reservation',
      body: 'Reservation for ' + date + ' requested',
      ios: {
        sound: true
      },
      android: {
        channelId: 'notification', //use the local object made in the compDidMOunt()
        color: '#512DA8'
      }
    });
  }

  render() {
    return (
      <ScrollView>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Number of Guests</Text>
            <Picker
              style={styles.formItem}
              selectedValue={this.state.guests}
              onValueChange={(itemValue, itemIndex) => this.setState({ guests: itemValue })}>
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="6" value="6" />
            </Picker>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
            <Switch
              style={styles.formItem}
              value={this.state.smoking}
              trackColor='#512DA8'
              onValueChange={(value) => this.setState({ smoking: value })}>
            </Switch>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Date and Time</Text>
            <DatePicker
              style={{ flex: 2, marginRight: 20 }}
              date={this.state.date}
              format=''
              mode="datetime"
              placeholder="Select date and Time"
              minDate="2017-01-01"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 36
                }
                // ... You can check the source to find the other keys. 
              }}
              onDateChange={(date) => { this.setState({ date: date }) }}
            />
          </View>
          <View style={styles.formRow}>
            <Button
              onPress={() => this.handleReservation()}
              title="Reserve"
              color="#512DA8"
              accessibilityLabel="Learn more about this purple button"
            />
          </View>
          <Modal animationType={"slide"} transparent={false}
            visible={this.state.showModal}
            onDismiss={() => this.toggleModal()}
            onRequestClose={() => this.toggleModal()}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Your Reservation</Text>
              <Text style={styles.modalText}>Number of Guests: {this.state.guests}</Text>
              <Text style={styles.modalText}>Smoking?: {this.state.smoking ? 'Yes' : 'No'}</Text>
              <Text style={styles.modalText}>Date and Time: {this.state.date}</Text>

              <Button
                onPress={() => { this.toggleModal(); this.resetForm(); }}
                color="#512DA8"
                title="Close"
              />
            </View>
          </Modal>
      </ScrollView>
    );
  }

};

const styles = StyleSheet.create({
  formRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    margin: 20
  },
  formLabel: {
    fontSize: 18,
    flex: 2 //will occupy 2/3rd of the space
  },
  formItem: {
    flex: 1
  },
  modal: {
    justifyContent: 'center',
    margin: 20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#512DA8',
    textAlign: 'center',
    color: 'white',
    marginBottom: 20
  },
  modalText: {
    fontSize: 18,
    margin: 10
  }
});

export default Reservation;