import React, { Component } from 'react';
import { View, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TextInput, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";

// class Authentification screen
export default class Auth extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: '',
            password: ''
        }
    }

    componentDidMount() {
        this.CheckAuth();
    }

    CheckAuth = () => {
        console.log(auth().currentUser);
        const unsubscribe = NetInfo.addEventListener(state => {
            console.log("Is connected?", state.isConnected);
            if (state.isConnected == true) {
                if (auth().currentUser !== null) {
                    console.log('auth');
                    this.props.navigation.navigate('HomeStack');
                } else {
                    return;
                }
            } else {
                Alert.alert('Ошибка', 'Отсутствует подключение к интернету.')
            }
          });
        
    }

    Enter = () => {
        let email = this.state.email;
        let password = this.state.password;

        if (!email || !password) {
            Alert.alert('Невозможно войти', 'Почта или пароль не заполнены!');
            return
        } else {
            console.log(email, password);
            this.doSingIn(email, password);
        }
    }

    doSingIn = async (email, password) => {
        console.log(auth().currentUser);
        try {
            let response = await auth().signInWithEmailAndPassword(email, password)
            if (response && response.user) {
                this.props.navigation.navigate('HomeStack');
            }
        } catch (e) {
            Alert.alert('', 'Пользователь не найден или отсутствует подключение к интернету.');
        }
    }

    render() {
        return (
            <ImageBackground style={{width:'100%', height:'100%'}} source={require('./assets/background.png')}>
                <SafeAreaView style={{flex: 1}}>
                    <View style={{alignItems:'center', justifyContent: 'center', flex:3}}>
                        <Image source={require('./assets/logo1.png')} style={{width:100, height: 100}} />
                    </View>
                    <View style={{alignItems:'flex-end', justifyContent: 'center', flex:2, flexDirection: 'row'}}>
                        <Image source={require('./assets/iconTabUser.png')} style={{width: 50, height: 50, tintColor:'white'}} />
                        <Text style={styles.textTitle}>Войдите в систему</Text>
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'space-evenly', flex:3}}>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => this.setState({
                                email: text
                            })}
                            placeholder="Почта"
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            onChangeText={text => this.setState({
                                password: text
                            })}
                            placeholder="Пароль"
                            keyboardType="default"
                            secureTextEntry
                        />
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'center', flex:1}}>
                        <TouchableOpacity onPress={() => this.Enter()}>
                            <Text style={styles.enter}>Войти</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{alignItems:'flex-start', justifyContent: 'space-evenly', flex:1, flexDirection:'row'}}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('LosePassword')}>
                            <Text style={styles.forgotPassword}>Забыли пароль?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Registration')}>
                            <Text style={styles.registration}>Регистрация</Text>
                        </TouchableOpacity>
                    </View>
                    {/* <View style={{alignItems:'center', justifyContent: 'flex-start', flex:1}}>
                        
                    </View> */}
                </SafeAreaView>
            </ImageBackground>
        )
    }
}

var styles = StyleSheet.create({
    textTitle: {
        textAlign:'center',
        fontSize:18,
        margin: 15,
        color: 'black',
        textAlignVertical:'center'
    },
    input: {
        borderWidth: 1,
        height: 40,
        borderWidth: 1,
        borderRadius: 15,
        backgroundColor:'white',
        fontSize: 15,
        width:'70%',
        textAlign:'center'
    },
    enter: {
        textAlign:'center',
        fontSize:20,
        color: 'black',
        borderRadius: 15,
        backgroundColor:'rgba(255, 255, 255, 0.7)',
        paddingHorizontal: 15,
        paddingVertical: 2
    },
    forgotPassword: {
        textAlign:'center',
        fontSize:18,
        color: 'black',
    },
    registration: {
        textAlign:'center',
        fontSize:18,
        color: 'black',
        fontWeight:'bold'
    }
})