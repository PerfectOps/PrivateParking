import React, { Component, useState } from 'react';
import { Alert, PermissionsAndroid, View, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Button,  } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';

export default class QR extends Component {
    constructor(props){
        super(props);
        this.state = {
            verifyEmail: false,
            result: '',
            scan: true,
            address: [],
            data: {},
            login: ''
        }
    }

    componentDidMount() {
        this.VerifyEmail();
        this.GetParkItem();
        this.PermissionCam();
    }

    // Проверка верификации почты
    VerifyEmail = () => {
        if (auth().currentUser.emailVerified !== false) {
            this.setState({
                verifyEmail: true,
                login: auth().currentUser.email
            })
        }
        else {
            Alert.alert('Почта не подтверждена!', 'Для начала перейдите по ссылке в письме.');
            this.setState({
                verifyEmail: false
            })
            this.props.navigation.navigate('Home');
        }
    }

    // Запрос разрешения пользования камерой
    async PermissionCam() {
        const chckCameraPermission = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (chckCameraPermission === PermissionsAndroid.RESULTS.GRANTED) {
            //   alert("You've access for the location");
        } else {
            try {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        'title': "Разрешение для Private Parking",
                        'message': "Приложению Private Parking требуется доступ к вашей камере " +
                                "чтобы вы могли сканировать QR коды.",
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the camera");
                } else {
                    Alert.alert("Вы не дали доступ к камере", "Перейдите в настройки приложение и дайте разрешение на использование камеры.");
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    // Получение данных о парковках с бд
    GetParkItem = () => {
        let addressArr = [];
        let address = [];
        firestore()
        .collection('address1')
        .doc("r958l80MBiGEZufawkVG")
        .onSnapshot(documentSnapshot => {
            if (documentSnapshot === null) {
                console.log('nea');
            }
            else {
                let link = documentSnapshot.data();
                console.log('array firestore: ', link);
                this.setState({
                    data: link
                })
                console.log('parking ', this.state.data);
                Object.keys(link.coordinate).forEach(key => { 
                    addressArr.push([key, link.coordinate[key]]) 
                })
                addressArr.map(mark => address.push(mark[0]));
                this.setState({
                    address: address
                })
                console.log('address: ', this.state.address);
            }
        });
    };

    // Сканирование qr кода, на вход подаем название парковки
    ScanQRCode = (result) => {
        let address = this.state.address;
        let data = this.state.data;
        let getDate = new Date();
        console.log('result ', result);
        console.log('data ', data);
        if (address.includes(result) == true) { // Проверка на наличие такой парковки в бд
            if (data.coordinate[result][3] < data.coordinate[result][2]) { // Проверка на заполненность парковки
                AsyncStorage.getItem('parking').then((value) => {
                    this.setState({
                        scan: false
                    })
                    setTimeout(() => {
                        this.setState({
                            scan: true
                        })
                    }, 3000);
                    AsyncStorage.getItem('reserved').then((reserved) => {
                        if (reserved == 'false') { // Блок если бронирования нет
                            if (value !== 'false') { // Если на данный момент парковка занята
                                if (result == value) {  // Если отсканированный код соответствует занятой парковке
                                    data.coordinate[result][3] = data.coordinate[result][3] + 1;
                                    this.setState({
                                        data: data
                                    })
                                    console.log('data1 ', this.state.data.coordinate);
                                    firestore()
                                        .collection('address1')
                                        .doc('r958l80MBiGEZufawkVG')
                                        .update({
                                            'coordinate': this.state.data.coordinate
                                        })
                                        .then(() => {
                                            console.log('User updated!');
                                        });
            
                                    let addOutput = { parking: [this.state.login, result, '"'+getDate.getDate() + "." + getDate.getMonth() + "." + getDate.getFullYear()+'"', 
                                        '"'+getDate.getHours() + ":" + getDate.getMinutes() + ":" + getDate.getSeconds()+'"' ]};
                                    console.log('addOutput ', addOutput);
                                    firestore()
                                        .collection('history')
                                        .add({
                                            exit: addOutput
                                        })
                                        .then(() => {
                                            console.log('User added!');
                                        });
                                    AsyncStorage.setItem('parking', 'false');
                                    this.EndTook();
                                    return;
                                } else if (result !== value) {
                                    Alert.alert('', 'У вас уже есть занятое место на другой парковке.');
                                    return;
                                }
                            } else { // Парковка не занята
                                AsyncStorage.setItem('parking', result);
                                data.coordinate[result][3] = data.coordinate[result][3] - 1;
                                this.setState({
                                    data: data
                                })
                                console.log('data2 ', this.state.data.coordinate);
                                firestore()
                                    .collection('address1')
                                    .doc('r958l80MBiGEZufawkVG')
                                    .update({
                                        'coordinate': this.state.data.coordinate
                                    })
                                    .then(() => {
                                        console.log('User updated!');
                                    });
                                
                                let addInput = { parking: [this.state.login, result, '"'+getDate.getDate() + "." + getDate.getMonth() + "." + getDate.getFullYear()+'"', 
                                                '"'+getDate.getHours() + ":" + getDate.getMinutes() + ":" + getDate.getSeconds()+'"' ]};
                                console.log('addInput ', addInput);
                                firestore()
                                    .collection('history')
                                    .add({
                                        entry: addInput
                                    })
                                    .then(() => {
                                        console.log('User added!');
                                    });
                                this.StartTook(result);
                            }
                            return;
                        } else { // Если есть бронирование
                            if (result == reserved) { // Если забронированное место такое же как парковка на въезд
                                AsyncStorage.setItem('reserved', 'false');
                                AsyncStorage.setItem('parking', result);
                                ReactNativeForegroundService.remove_task('reserv');
                                ReactNativeForegroundService.stop();
                                setTimeout(() => {
                                    this.StartTook(result);
                                }, 1000);
                                let addInput = { parking: [this.state.login, result, '"'+getDate.getDate() + "." + getDate.getMonth() + "." + getDate.getFullYear()+'"', 
                                                '"'+getDate.getHours() + ":" + getDate.getMinutes() + ":" + getDate.getSeconds()+'"' ]};
                                console.log('addInput ', addInput);
                                firestore()
                                    .collection('history')
                                    .add({
                                        entry: addInput
                                    })
                                    .then(() => {
                                        console.log('User added!');
                                    });
                            } else { // Если пользователь решил поехать с бронью на другую парковку
                                AsyncStorage.setItem('reserved', 'false');
                                AsyncStorage.setItem('parking', result);
                                ReactNativeForegroundService.remove_task('reserv');
                                ReactNativeForegroundService.stop();
                                AsyncStorage.setItem('parking', result);
                                data.coordinate[reserved][3] = data.coordinate[reserved][3] + 1;
                                this.setState({
                                    data: data
                                })
                                firestore()
                                    .collection('address1')
                                    .doc('r958l80MBiGEZufawkVG')
                                    .update({
                                        'coordinate': this.state.data.coordinate
                                    })
                                    .then(() => {
                                        console.log('User updated!');
                                    });
                                data.coordinate[result][3] = data.coordinate[result][3] - 1;
                                this.setState({
                                    data: data
                                })
                                firestore()
                                    .collection('address1')
                                    .doc('r958l80MBiGEZufawkVG')
                                    .update({
                                        'coordinate': this.state.data.coordinate
                                    })
                                    .then(() => {
                                        console.log('User updated!');
                                    });
                                
                                let addInput = { parking: [this.state.login, result, '"'+getDate.getDate() + "." + getDate.getMonth() + "." + getDate.getFullYear()+'"', 
                                                '"'+getDate.getHours() + ":" + getDate.getMinutes() + ":" + getDate.getSeconds()+'"' ]};
                                console.log('addInput ', addInput);
                                firestore()
                                    .collection('history')
                                    .add({
                                        entry: addInput
                                    })
                                    .then(() => {
                                        console.log('User added!');
                                    });
                                this.StartTook(result);
                            }
                        }
                    }).done();
                    
                }).done();
            } else {
                Alert.alert('Отмена', 'Свободных мест на парковке нет. Пожалуйста развернитесь.')
            }
        } else {
            Alert.alert('', 'Такой парковки еще нет.')
        }
    }

    StartTook = (place) => {
        ReactNativeForegroundService.start({
            id: 144,
            title: 'Парковка '+place+'',
            message: 'Место на парковке '+ place +' занято',
        });
        ReactNativeForegroundService.add_task(() => console.log('I am Being Tested'), {
            delay: 1000,
            onLoop: false,
            taskId: 'parking',
            onError: (e) => console.log(`Error logging:`, e),
            onSuccess: () => {  }
        });
    }

    EndTook = () => {
        ReactNativeForegroundService.remove_task('parking');
        ReactNativeForegroundService.stop();
    }

    render() {
        if (this.state.verifyEmail == true) {
        return (
            <ImageBackground style={{width:'100%', height:'100%'}} source={require('./assets/background.png')}>
                <SafeAreaView style={{flex: 1}}>
                    <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    >
                    <View style={{flex:1}}>
                        <View style={{alignItems:'center', justifyContent: 'flex-start', flex:1}}>
                            <Text style={styles.centerText}>{this.state.result}</Text>
                        </View>
                        { this.state.scan &&
                        <View style={{flex:1, alignItems:'center'}}>
                            <QRCodeScanner
                            reactivate={true}
                            showMarker={true}
                            // ref={(node) => { this.scanner = node }}
                            onRead={(e) => this.ScanQRCode(e.data)}
                            containerStyle={{height:'100%'}}
                            // topContent={
                            //     <Text style={styles.centerText}>
                            //     Scan your QRCode!
                            //     </Text>
                            // }
                            />
                        </View>
                        }
                    </View>
                    </ScrollView>
                </SafeAreaView>
            </ImageBackground>
        );
        } else {
            return (
                <ImageBackground style={{width:'100%', height:'100%'}} source={require('./assets/background.png')}>
                    <View style={{alignItems:'center', justifyContent: 'flex-start', flex:2}}>
                        <Image source={require('./assets/logo1.png')} style={{width:100, height: 100}} />
                    </View>
                    <View style={{alignItems:'center', justifyContent: 'flex-start', flex:1}}>
                        <Text style={styles.textWrong}>Для начала верифицируйте свой аккаунт!</Text>
                    </View>
                    <View style={{flex: 1}}>

                    </View>
                </ImageBackground>
            )
        }
    }
}

var styles = StyleSheet.create({
    barcodeTextURL: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    scrollView: {
        // backgroundColor: Colors.lighter,
      },
      body: {
        // backgroundColor: 'white',
      },
      sectionContainer: {
        // marginTop: 32,
      },
      sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: 'black',
      },
      sectionDescription: {
        flex:1
        // marginTop: 8,
        // fontSize: 18,
        // fontWeight: '400',
        // color: Colors.dark,
      },
      highlight: {
        fontWeight: '700',
      },
      footer: {
        // color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
      },
      centerText: {
        // flex: 1,
        fontSize: 30,
        padding: 32,
        color: 'black',
      },
      textWrong: {
        fontSize: 18,
        // padding: 32,
        color: 'black',
        fontWeight:'bold'
      },
      textBold: {
        fontWeight: '500',
        color: '#000',
      },
      buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)',
      },
      buttonTouchable: {
        padding: 16,
      },
})