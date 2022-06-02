import React, { Component, createRef, useRef } from 'react';
import { View, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TouchableOpacity, NativeSyntheticEvent, PermissionsAndroid, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YaMap, Animation, Marker } from 'react-native-yamap';
import firestore from '@react-native-firebase/firestore';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import auth from '@react-native-firebase/auth';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

YaMap.init('API_KEY_MAPKIT'); // ключ API MapKit

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
            traffic: false,
            data: {},
            reserv: 'Бронирование'
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
                        'title': 'Разрешение для Private Parking',
                        'message': "Приложению Private Parking требуется доступ к вашему местоположению " +
                                "чтобы вы могли полноценно пользоваться приложением."
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    //   alert("You've access for the location");
                } else {
                    Alert.alert("Вы не дали доступ к местоположению", "Перейдите в настройки приложения и дайте разрешение на использование местоположения.");
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
                console.log('maps: ', link);
                this.setState({
                    data: link
                })
                Object.keys(link.coordinate).forEach(key => { 
                    marker.push([key, link.coordinate[key]]) 
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
        let data = this.state.data;
        AsyncStorage.getItem('parking').then((value) => {
            if (value == 'false') { // Проверка на то что пользователь не находится на парковке на данный момент
                AsyncStorage.getItem('reserved').then((reserved) => {
                    console.log('reserved: ', reserved);
                    if (data.coordinate[this.state.dataMarker[0]][3] < data.coordinate[this.state.dataMarker[0]][2]) { // Если парковочных мест хватает
                        if (reserved == 'false') { // Если сейчас нет брони
                            AsyncStorage.setItem('reserved', this.state.dataMarker[0]);
                            Alert.alert('Бронирование', 'За вами забронировано место на 30мин.')
                            ReactNativeForegroundService.start({
                                id: 144,
                                title: 'Бронирование парковки',
                                message: 'Место на парковке '+ this.state.dataMarker[0] +' забронировано',
                            });
                            data.coordinate[this.state.dataMarker[0]][3] = data.coordinate[this.state.dataMarker[0]][3] - 1;
                            this.setState({
                                data: data,
                                reserv: 'Отменить бронь'
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
                            let task = 0;
                            ReactNativeForegroundService.add_task(() => console.log('I am Being Tested'), {
                                delay: 1800000,
                                onLoop: true,
                                taskId: 'reserv',
                                onError: (e) => console.log(`Error logging:`, e),
                                onSuccess: () => {
                                    if (task == 0) {
                                        task = 1;
                                    } else {
                                        AsyncStorage.setItem('reserved', 'false');
                                        data.coordinate[this.state.dataMarker[0]][3] = data.coordinate[this.state.dataMarker[0]][3] + 1;
                                        this.setState({
                                            data: data,
                                            reserv: 'Бронирование'
                                        })
                                        console.log('data1 ', this.state.data.coordinate);
                                        firestore()
                                            .collection('address1')
                                            .doc('r958l80MBiGEZufawkVG')
                                            .update({
                                                'coordinate': this.state.data.coordinate
                                            })
                                            .then(() => {
                                                console.log('Бронь снята!');
                                            });
                                        ReactNativeForegroundService.remove_task('reserv');
                                        ReactNativeForegroundService.stop();
                                        ReactNativeForegroundService.start({
                                            id: 144,
                                            title: 'Бронирование парковки',
                                            message: 'Время бронирования истекло!'
                                        })
                                        setTimeout(() => {
                                            ReactNativeForegroundService.stop();
                                        }, 10000);
                                    }
                                }
                            });
                            return;
                        } else {
                            AsyncStorage.setItem('reserved', 'false');
                            this.setState({
                                reserv: 'Бронирование'
                            })
                            data.coordinate[this.state.dataMarker[0]][3] = data.coordinate[this.state.dataMarker[0]][3] + 1;
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
                                    console.log('Бронь снята руками!');
                                });
                            ReactNativeForegroundService.remove_task('reserv');
                            ReactNativeForegroundService.stop();
                        }
                    } else {
                        Alert.alert('Отмена', 'Свободных мест на парковке нет. Бронирование невозможно.')
                    }
                }).done();
            } else {
                Alert.alert('Невозможно.', 'Вы уже находитесь на парковке.');
            }
        }).done();
    }

    render() {
        if (this.state.marker == undefined) {
            return (
                <ImageBackground style={{width:'100%', height:'100%'}} source={require('./assets/background.png')}>
                    <View style={{alignItems:'center', justifyContent: 'space-around', flex:1}}>
                        <ActivityIndicator size="large" color="black" />
                    </View>
                </ImageBackground>
            )
        } else {
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
                                <Text style={styles.reserv}>{this.state.reserv}</Text>
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
                                                            scale={2} 
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
                    <View style={{position: 'absolute', bottom: 80, right: 20}}>
                        <SafeAreaView />
                        <TouchableOpacity onPress={this.zoomUp}>
                            <Text style={styles.plus1}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{position: 'absolute', bottom: 30, right: 20}}>
                        <SafeAreaView />
                        <TouchableOpacity onPress={this.zoomDown}>
                            <Text style={styles.plus}>—</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }
}

var styles = StyleSheet.create({
    plus: {
        fontSize:30,
        color:'black',
        backgroundColor:'rgba(255, 255, 255, 0.4)',
        fontWeight:'bold',
        paddingHorizontal:5,
        borderColor:'black',
        borderWidth:1,
        borderRadius:15,
        textAlign:'center'
    },
    plus1: {
        fontSize:30,
        color:'black',
        backgroundColor:'rgba(255, 255, 255, 0.4)',
        fontWeight:'bold',
        paddingHorizontal:10,
        borderColor:'black',
        borderWidth:1,
        borderRadius:15,
        textAlign:'center'
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
        borderRadius: 15,
        paddingHorizontal:20
    },
    textWrong: {
        fontSize: 18,
        // padding: 32,
        color: 'black',
        fontWeight:'bold'
    },
})
