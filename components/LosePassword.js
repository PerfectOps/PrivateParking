import React, { Component } from 'react';
import { View, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, TextInput, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default class LosePassword extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: ''
        }
    }

    componentDidMount() {

    }

    LosePass = () => {
        let email = this.state.email;

        if (email == '') {
            Alert.alert('Невозможно выполнить', 'Введите почту в нужное поле для сброса');
        } else {
            auth().sendPasswordResetEmail(email);
            Alert.alert('', 'Инструкция по сбросу пароля отправлена вам на почту.');
            this.props.navigation.navigate('Auth');
        }
    }

    render() {
        return (
            <ImageBackground style={{width:'100%', height:'100%'}} source={require('./assets/background.png')}>
                <SafeAreaView style={{flex: 1}}>
                    <View style={{alignItems:'center', justifyContent: 'center', flex:3}}>
                        <Image source={require('./assets/logo1.png')} style={{width:100, height: 100}} />
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'center', flex:2}}>
                        <Text style={styles.title}>Сброс пароля</Text>
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'flex-start', flex:4}}>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => this.setState({
                                email: text
                            })}
                            placeholder="Почта"
                            keyboardType='email-address'
                        />
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'center', flex:3}}>
                        <TouchableOpacity onPress={() => this.LosePass()}>
                            <Text style={styles.enter}>Отправить</Text>
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
})