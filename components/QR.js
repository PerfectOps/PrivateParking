import React, { Component, useState } from 'react';
import { Alert, PermissionsAndroid, View, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Button,  } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// const cameraPermission = Camera.getCameraPermissionStatus();
// const newCameraPermission = Camera.requestCameraPermission();

export default class QR extends Component {
    constructor(props){
        super(props);
        this.state = {
            verifyEmail: false,
            result: '',
            scan: true
        }
    }

    // onSuccess = (e) => {
    //     setResult(e.data)
    //     setScan(false)
    // }
    
    // function startScan() {
    //     setScan(true)
    //     setResult()
    // }

    componentDidMount() {
        this.VerifyEmail();
        this.PermissionCam();
        this.GetParkItem();
    }

    VerifyEmail = () => {
        if (auth().currentUser.emailVerified !== false) {
            this.setState({
                verifyEmail: true
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

    async PermissionCam() {
        try {
            const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
                title: "Cool Photo App Camera Permission",
                message:
                "Cool Photo App needs access to your camera " +
                "so you can take awesome pictures.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                
                console.log("You can use the camera");
            } else {
                console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    };

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
                Object.keys(link).forEach(key => { 
                    addressArr.push([key, link[key]]) 
                })
                addressArr.map(mark => address.push(mark[0]));
                console.log(address);
            }
        });
    };

    ScanQRCode = () => {
        this.setState({
            result: e.data
        }); 
        this.setState({
            scan: false
        }); 
        setTimeout(() => {
            this.setState({
                scan: true
            })
        }, 2000);
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
                            onRead={(e) => {this.setState({result: e.data}); this.setState({scan: false}); setTimeout(() => {
                                this.setState({scan: true})
                            }, 2000);}}
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