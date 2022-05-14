import React, { Component } from 'react';
import { View, Alert, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

let iconNo = require('./assets/iconNo.png');
let iconYes = require('./assets/iconYes.png');

export default class Home extends Component {
    constructor(props){
        super(props);
        this.state = {
            userName: '',
            emailVerifiedIcon: null,
            emailVerifiedText: '',
            parking: ''
        }
    }

    onAuthStateChanged = () => {
        let userName = this.state.userName;
        console.log(auth().currentUser);
        userName = auth().currentUser.email;
        if (auth().currentUser.emailVerified == true) {
            this.setState({
                emailVerifiedIcon: iconYes,
                emailVerifiedText: 'Учетная запись подтверждена!'
            })
        } else {
            this.setState({
                emailVerifiedIcon: iconNo,
                emailVerifiedText: 'Подтвердите учетную запись!'
            })
        }
        this.setState({
            userName: userName
        })
        if (auth().currentUser.emailVerified !== false) {
            return;
        }
        else {
            Alert.alert('Почта не подтверждена!', 'Для начала перейдите по ссылке в письме.');
        }
    }

    componentDidMount() {
        this.onAuthStateChanged();
        this.ControlParking();
        // let sub = auth().onAuthStateChanged();
        // console.log(sub);
    }

    componentDidUpdate() {
        
    }

    ControlParking = () => {
        AsyncStorage.getItem('parking').then((value) => {
            if (value == null) {
                AsyncStorage.setItem('parking', 'false');
            }
            console.log(value);
            this.setState({
                parking: value
            })
        }).done();
        
    }

    SignOut = () => {
        auth().signOut();
        this.props.navigation.navigate('Auth');
    }
 
    render() {
        return (
            <ImageBackground style={{width:'100%', height:'100%'}} source={require('./assets/background.png')}>
                <View style={{flex: 1, backgroundColor:'rgba(251, 255, 0, 0.3)', borderRadius:15}}>
                    <View style={{alignItems:'center', justifyContent: 'space-between', flex:1, flexDirection: 'row'}}>
                        <Image source={require('./assets/iconTabUser.png')} style={{width: 80, height: 80, tintColor:'black', marginLeft:10}} />
                        <Text style={styles.textTitle}>{this.state.userName}</Text>
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'space-between', flex:1, flexDirection: 'row'}}>
                        <Image source={this.state.emailVerifiedIcon} style={{width: 80, height: 80, marginLeft:10}} />
                        <Text style={styles.textTitle}>{this.state.emailVerifiedText}</Text>
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'center', flex:1, flexDirection: 'row'}}>
                        <Text style={styles.textTitle}>{this.state.parking}</Text>
                    </View>
                </View>
                <View style={{alignItems:'flex-start', justifyContent: 'flex-end', flex:1, margin: 15}}>
                    <TouchableOpacity onPress={() => this.SignOut()}>
                        <Text style={styles.deleteAccount}>Выйти из аккаунта</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }
}

var styles = StyleSheet.create({
    textTitle: {
        color:'black',
        fontSize: 18,
        textAlign:'center',
        marginRight:'5%'
    },
    deleteAccount: {
        color: 'black',
        fontSize:16,
        backgroundColor:'rgba(255, 0, 0, 0.4)',
        padding: 8,
        borderRadius:120,
        borderWidth:2,
        textAlign:'center',
        fontWeight:'bold'
    }
})