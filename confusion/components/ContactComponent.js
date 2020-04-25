import React, { Component } from 'react';
import { View, FlatList,Text } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import { ListItem} from 'react-native-elements';
import * as MailComposer from 'expo-mail-composer'

class Contact extends Component{
    constructor(props)
    {
        super(props)
    
    }
    static navigationOptions = {
        title: 'Contact Us'
    };
    sendMail() {
        MailComposer.composeAsync({
            recipients: ['confusion@food.net'],
            subject: 'Enquiry',
            body: 'To whom it may concern:'
        })
    }
    render()
    {
        return(
        <Card
        title='Contact Information'
        >
            <Text style={{margin: 10}}>
            121, Clear Water Bay Road
             Clear Water Bay, Kowloon
            HONG KONG
            Tel: +852 1234 5678
            Fax: +852 8765 4321
            Email:confusion@food.net
            </Text>
            <Button
                        title="Send Email"
                        buttonStyle={{backgroundColor: "#512DA8"}}
                        icon={<Icon name='envelope-o' type='font-awesome' color='white' />}
                        onPress={this.sendMail}
                        />
        </Card>);
    }
}
export default Contact;