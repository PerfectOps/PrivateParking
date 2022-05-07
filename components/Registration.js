import React, { Component } from 'react';
import { View, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TouchableOpacity, TextInput, SafeAreaView, Dimensions, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const __isValidEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export default class Registration extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            acceptTerms: true
        }
    }

    componentDidMount() {

    }

    CreateUser = async (email, password) => {
        const actionCodeSettings = {
            handleCodeInApp: true,
            url: 'https://privateparking-6b163.firebaseapp.com/__/auth/action?mode=action&oobCode=code',
            android: {
                installApp: true,
                packageName: 'com.privatep.parking',
            },
        };
        try {
          let response = await auth().createUserWithEmailAndPassword(
            email,
            password
          )
          if (response && response.user) {
            await auth().currentUser.sendEmailVerification();
            console.log(auth().currentUser);
            Alert.alert("Учетная запись создана! ✅", "Вам на почту отправлено письмо, подтвердите её.");
            setTimeout(() => {
                this.props.navigation.navigate('Auth');
            }, 1000);
          }
        } catch (e) {
            Alert.alert('Пользователь с таким Email уже существует!')
          console.error(e.message);
        }
    }

    SendReg = () => {
        let email = this.state.email;
        let password = this.state.password;
        let confirmPassword = this.state.confirmPassword;

        if ((email == '') || (password == '') || (confirmPassword == '')) {
            Alert.alert('Невозможно зарегистрироваться', 'Заполните все поля!');
            return;
        } else if (password.length < 6) {
            Alert.alert('', "Weak password, minimum 6 chars")
            return;
        } else if (password !== confirmPassword) {
            Alert.alert('Невозможно зарегистрироваться', 'Поля паролей не совпадают!');
            return;
        } else if (!__isValidEmail(email)) {
            Alert.alert('', "Invalid Email")
            return
        } else  {
            let data = '{"email: "'+email+
                        '", "password: "'+password+
                        '", "confirmPassword: "'+confirmPassword+'"}';
            console.log(data);
            this.CreateUser(email, password);
        } 
    }

    render() {
        return (
            <ImageBackground style={{width:'100%', height:'100%'}} source={require('./assets/background.png')}>
                <SafeAreaView style={{flex: 1}}>
                    <View style={{alignItems:'center', justifyContent: 'center', flex:3}}>
                            <Image source={require('./assets/logo1.png')} style={{width:100, height: 100}} />
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'flex-start', flex:2}}>
                        <Text style={styles.title}>Регистрация</Text>
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'space-evenly', flex:4}}>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => this.setState({
                                email: text
                            })}
                            placeholder="Почта"
                            keyboardType='email-address'
                        />
                        <TextInput
                            style={styles.input}
                            onChangeText={text => this.setState({
                                password: text
                            })}
                            placeholder="Пароль"
                            keyboardType='default'
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            onChangeText={text => this.setState({
                                confirmPassword: text
                            })}
                            placeholder="Подтвердите пароль"
                            keyboardType="default"
                            secureTextEntry
                        />
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'space-around', flex:1}}>
                        <TouchableOpacity onPress={() => this.SendReg()}>
                            <Text style={styles.enter}>Отправить</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'flex-start', flex:1}}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Auth')}>
                            <Text style={styles.auth}>Уже зарегистрированы? Войти</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        )
    }
}

var styles = StyleSheet.create({
    title: {
        textAlign:'center',
        fontSize:30,
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
    auth: {
        textAlign:'center',
        fontSize:18,
        color: 'black',
        fontWeight:'bold'
    }
})