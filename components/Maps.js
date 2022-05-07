import React, { Component, createRef, useRef } from 'react';
import { View, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TouchableOpacity, NativeSyntheticEvent, PermissionsAndroid, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YaMap, Animation, Marker } from 'react-native-yamap';
import firestore from '@react-native-firebase/firestore';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import BackgroundTimer from 'react-native-background-timer';
import auth from '@react-native-firebase/auth';

YaMap.init('b37481d4-ebd4-45f6-9379-f130139dd549');
// Geocoder.init('d3f72065-ba03-461e-b90b-429823953264');

// YaMap.getLocale(); 
// YaMap.setLocale('ru_RU'); // 'ru_RU'

export default class Maps extends Component {
    constructor(props){
        super(props);
        this.state = {
            marker: undefined,
            polyline: [],
            night: false,
            address: undefined,
            dataMarker: [],
            parkLot: [],
            verifyEmail: false,
            traffic: false
        }
        this.map = React.createRef();
    }
    
    componentDidMount() {
        this.VerifyEmail();
        this.GetMarker();
        this.requestLocationPermission();
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

    async requestLocationPermission() {
        const chckLocationPermission = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (chckLocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
            //   alert("You've access for the location");
        } else {
            try {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        'title': 'Cool Location App required Location permission',
                        'message': 'We required Location permission in order to get device location ' +
                            'Please grant us.'
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    //   alert("You've access for the location");
                } else {
                    alert("You don't have access for the location");
                }
            } catch (err) {
                alert(err)
            }
        }
    };

    GetMarker = () => {
        let marker = [];
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
                    marker.push([key, link[key]]) 
                })
                console.log('address marker firestore: ', marker.map(mark => console.log(mark[1][0])));
                this.setState({
                    marker: marker
                })
                this.zoomToMarker();
            }
        });
    }

    getCurrentPosition() {
        return new Promise((resolve) => {
            if (this.map.current) {
                this.map.current.getCameraPosition((position) => {
                    resolve(position);
                    console.log('position ', position);
                });
            }
        });
    };
    
    zoomUp = async () => {
        const position = await this.getCurrentPosition();
        if (this.map.current) {
            this.map.current.setZoom(position.zoom * 1.1, 0.1);
        }
    };
  
    zoomDown = async () => {
      const position = await this.getCurrentPosition();
      if (this.map.current) {
        this.map.current.setZoom(position.zoom * 0.9, 0.1);
      }
    };

    zoomToMarker = () => {
      if (this.map.current) {
        this.map.current.setCenter(
        {lat: 47.25999, lon: 39.72003},
          11,
          0,
          0,
          0.4,
          Animation.SMOOTH,
        );
        // this.map.current.setTrafficVisible(true);
      }
      else {
          console.log(this.map)
      }
    };
  
    toggleNightMode = () => {
      this.setState({night: !this.state.night});
    };

    TrafficOn = () => {
        this.setState({
            traffic: !this.state.traffic
        })
        this.map.current.setTrafficVisible(this.state.traffic);
    }

    OpenCardMarker = (coord) => {
        let dataMarker = this.state.dataMarker;
        dataMarker = coord;
        let parkLot = [];
        parkLot.push(coord[1][3]);
        parkLot.push(coord[1][2]);
        console.log('coord', coord);
        this.setState({
            dataMarker: dataMarker,
            parkLot: parkLot
        })
        console.log('dataMarker: ', this.state.dataMarker, this.state.parkLot);
        SheetManager.show('card_marker');
        
        if (this.map.current) {
            this.map.current.setCenter(
            { lon: coord[1][0], lat: coord[1][1] },
              14,
              0,
              0,
              0.4,
              Animation.SMOOTH,
            );
        } else {
            console.log('error', this.map);
        }
    };

    ReservLot = () => {
        Alert.alert('Lot a reserv!')
        const timeoutId = BackgroundTimer.setTimeout(() => {
            // this will be executed once after 10 seconds
            // even when app is the the background
            Alert.alert('Lot dont reserv!');
            BackgroundTimer.clearTimeout(timeoutId);
        }, 900000);
    }

    render() {
        if (this.state.marker == undefined) {
            return (
                <View style={{alignItems:'center', justifyContent: 'space-around', flex:1}}>
                    <ActivityIndicator size="large" color="#00ff00" />
                </View>
            )
        } else if (this.state.verifyEmail == true) {
            return (
                <View style={{flex: 1}}>
                    <ActionSheet 
                        id="card_marker"
                        gestureEnabled={true}
                        // onBeforeShow={data => {this.setState({dataMarker: data}); console.log(this.state.dataMarker)}}
                        >
                        <View style={{marginBottom: 80}}>
                            <Text style={styles.popupText}>{this.state.dataMarker[0]}</Text>
                            <Text style={styles.popupText}>Количество мест: {this.state.parkLot[0]} из {this.state.parkLot[1]}</Text>
                        </View>
                        <View style={{marginBottom: 40}}>
                            <TouchableOpacity onPress={() => this.ReservLot()}>
                                <Text style={styles.reserv}>Забронировать место</Text>
                            </TouchableOpacity>
                        </View>
                    </ActionSheet>
                    <YaMap
                        style={{flex: 1}}
                        ref={this.map} 
                        setCenter={{}}
                        // showUserPosition={true}
                        nightMode={this.state.night}
                        userLocationIcon={require('./assets/iconUserGeo.png')}
                        >
                        {this.state.marker.map(mark => <Marker 
                                                            point={{lon: mark[1][0], lat: mark[1][1]}} 
                                                            scale={0.8} 
                                                            source={require('./assets/iconMarker.png')}
                                                            onPress={() => this.OpenCardMarker(mark)}
                                                        />)}
                    </YaMap>
                    <View style={{position: 'absolute', left: 20, top:10}}>
                        <SafeAreaView />
                        <TouchableOpacity onPress={() => this.TrafficOn()}>
                            <Image source={require('./assets/iconTraffic.png')} style={{width: 50, height: 50}} />
                        </TouchableOpacity>
                    </View>
                    <View style={{position: 'absolute', right: 20, top:10}}>
                        <SafeAreaView />
                        <TouchableOpacity onPress={() => this.toggleNightMode()}>
                            <Image source={require('./assets/iconDayandnight.png')} style={{width: 50, height: 50}} />
                        </TouchableOpacity>
                    </View>
                    <View style={{position: 'absolute', bottom: 50, right: 20}}>
                        <SafeAreaView />
                        <TouchableOpacity onPress={this.zoomUp}>
                            <Text style={styles.plus}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{position: 'absolute', bottom: 30, right: 20}}>
                        <SafeAreaView />
                        <TouchableOpacity onPress={this.zoomDown}>
                            <Text style={styles.plus}>-</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
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
    plus: {
        fontSize:25
    },
    popupText: {
        fontSize: 25, 
        color: 'black', 
        textAlign:'center',
        fontWeight:'bold'
    },
    reserv: {
        fontSize: 25,
        color:'black',
        backgroundColor:'orange',
        textAlign:'center',
        fontWeight:'bold',
        borderRadius: 15
    },
    textWrong: {
        fontSize: 18,
        // padding: 32,
        color: 'black',
        fontWeight:'bold'
    },
})