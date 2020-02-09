import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppRegistry,
  AsyncStorage,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ListItem,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  YellowBox,
} from 'react-native';
import {
  createAppContainer,
  createMaterialTopTabNavigator,
  createStackNavigator,
  createSwitchNavigator,
  NavigationEvents,
} from 'react-navigation';
import Modal from 'react-native-modal';
import ReactNativeParallaxHeader from 'react-native-parallax-header';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Font from 'expo-font';
import * as Permissions from 'expo-permissions';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
require("firebase/firestore");
import styled from 'styled-components';
import _ from 'lodash';
import PinInput from 'react-native-pin-input';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLabel } from "victory-native";

YellowBox.ignoreWarnings(['Setting a timer']);
YellowBox.ignoreWarnings(["Warning: Can't perform a React state update on an unmounted component"]);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

const firebaseConfig = {
  apikey: "AIzaSyALuIx8OzLr3UdK8l8puKFpTm3yt59v07w",
  authDomain: "ramabase-48504.firebaseapp.com",
  databaseURL: "https://ramabase-48504.firebaseio.com",
  projectId: "ramabase-48504",
  storageBucket: "ramabase-48504.appspot.com",
  messagingSenderId: "279798098533",
}

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

const tabHeight = Dimensions.get('window').height * (5 / 77);
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const qrSize = parseInt((2 / 3) * windowWidth);
const qrVBuff = parseInt(((windowHeight * (65 / 77)) - qrSize) / 2);
const cheight = parseInt(Dimensions.get('window').height * (65 / 770));
const profile = cheight * .70;
const work = parseInt(Dimensions.get('window').height * (65 / 77));
const chartainw = windowWidth * 0.8;
const chartainh = 250;

const e_dat = require('./assets/json/eur.json');
const y_dat = require('./assets/json/jpy.json');
const p_dat = require('./assets/json/gbp.json');
const c_dat = require('./assets/json/cad.json');
const k_dat = require('./assets/json/sek.json');
const f_dat = require('./assets/json/chf.json');

class AuthLoadingScreen extends Component {
  constructor(props) {
    super(props)
    this._bootstrapAsync();
  }

  _bootstrapAsync = async() => {
    const userToken = await AsyncStorage.getItem('userToken');
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render() {
    return (
      <AuthLoadView>
        <ActivityIndicator />
        <StatusBar barStyle='default' />
      </AuthLoadView>
    );
  }
}

class SignInWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
      user: '',
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    });

    this.setState({ fontLoaded: true });
  }

  handleInput = text => {
    this.setState({ user: text });
  };

  static navigationOptions = {
    title: 'Sign In'
  };

  render() {
    return (
      <Shell h={windowHeight} w={windowWidth}>
        {
          this.state.fontLoaded ? (
            <AuthLandingPage>
              <StyledInput
                underlineColorAndroid='transparent'
                placeholder='username'
                placeholderTextColor='#777777'
                autoCapitalize='none'
                onChangeText={this.handleInput}
              />
              <StyledSubmit
                onPress={this._signInAsync}
              >
                <SubmitText>
                  Log In
                </SubmitText>
              </StyledSubmit>
            </AuthLandingPage>
          ) : null
        }
      </Shell>
    );
  }

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', this.state.user);
    this.props.navigation.navigate('App');
  };
}

class VerificationWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
      pin: null,
      isModalVisible: false,
      correct: null,
      h: null,
    };
  }

  press = async () => {
    this.hide;

    db.collection('users').doc('seanr')
      .onSnapshot(function(doc) {
        this.setState({ h: doc.data().history });
      }.bind(this));

    var today = new Date();
    const key = today.toString();

    const b = await AsyncStorage.getItem('balance');
    const a = await AsyncStorage.getItem('amount');
    const newb = b - a;

    const r = await AsyncStorage.getItem('recipient');

    var history = this.state.h

    var rn = new Date();

    var postData = {
      time: rn,
      from: "Sean Rhee",
      to: r,
      amount: a,
    };

    history.unshift(postData);

    if (history.length > 30) {
      history.pop()
      db.collection('users').doc('seanr').update({
        balance: newb,
        history: history,
      });
    } else {
      db.collection('users').doc('seanr').update({
        balance: newb,
        history: history,
      });
    }

    this.props.navigation.navigate('App');
  }

  hide = () => {
    this.setState({ isModalVisible: false });
  }

  check = () => {
    if (parseInt(this.state.pin) === parseInt(this.state.correct)) {
      this.setState({ isModalVisible: true });
    } else {
      Alert.alert(
        'Wrong PIN',
        'Please enter the correct PIN',
        [
          {text: 'ok'}
        ],
        {cancelable: false},
      );
    }
  }

  async componentDidMount() {
    await Font.loadAsync({
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    });

    const name = await AsyncStorage.getItem('userToken')

    db.collection('users').doc(name)
      .onSnapshot(function(doc) {
        this.setState({ correct: doc.data().pin });
      }.bind(this));

    this.setState({ fontLoaded: true });
  }

  static navigationOptions = {
    title: 'Verify Payment'
  };

  go = () => {
    this.props.navigation.navigate('App');
  }

  render() {
    return (
      <Shell h={windowHeight} w={windowWidth}>
        {
          this.state.fontLoaded ? (
            <Shell h={windowHeight} w={windowWidth}>
              <StyledWorkspace>
                <Modal isVisible={this.state.isModalVisible}>
                  <AuthLoadView>
                    <ModalTab w={250} h={150}>
                      <ModalTextArea>
                        <ModalMessage>Transaction Completed!</ModalMessage>
                      </ModalTextArea>
                      <CloseModal onPress={this.press}>
                        <VText>OK</VText>
                      </CloseModal>
                    </ModalTab>
                  </AuthLoadView>
                </Modal>
                <PinHolder>
                  <EnterPin>
                    Enter PIN
                  </EnterPin>
                  <PinInput
                    style={{justifyContent: 'space-between', alignSelf: 'stretch', paddingBottom: 70, paddingTop: 20}}
                    ref={(input) => {
                      this.pin = input;
                    }}
                    autoFocus={true}
                    text=" "
                    pinLength={4}
                    pinItemStyle={{width: 50, height: 50, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 2, borderColor: '#696969'}}
                    pinItemProps={{keyboardType: 'number-pad', returnKeyType: 'done', secureTextEntry: false}}
                    placeholder={''}
                    onPinCompleted={(pin) => {
                      this.setState({pin: pin});
                    }}
                    containerStyle={{backgroundColor: 'transparent'}}
                    containerPinStyle={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      marginTop: 20,
                    }}
                  />
                  <ConfirmPin onPress={this.check}>
                    <VText>
                      Confirm
                    </VText>
                  </ConfirmPin>
                  <CancelHolder onPress={this.go}>
                    <CancelText>
                      Cancel
                    </CancelText>
                  </CancelHolder>
                </PinHolder>
                <PINBuffer />
              </StyledWorkspace>
            </Shell>
          ) : null
        }
      </Shell>
    );
  }
}

class QRWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
      hasCameraPermission: null,
      lastScannedUrl: null,
      history: null,
      bal: null,
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    });

    this.setState({ fontLoaded: true });

    this._requestCameraPermission();
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  };

  sendLNR = async (s_dat) => {
    this.setState({ lastScannedUrl: null });

    var j = JSON.parse(s_dat);

    await AsyncStorage.setItem('balance', this.state.bal.toString())
    await AsyncStorage.setItem('amount', j.a.toString())
    await AsyncStorage.setItem('recipient', j.r.toString())

    this.props.navigation.navigate('Verify');
  }

  _handleBarCodeRead = result => {
    db.collection('users').doc('seanr')
      .onSnapshot(function(doc) {
        this.setState({ h: doc.data().history });
        this.setState({ bal: doc.data().balance });
      }.bind(this));
    if (result.data !== this.state.lastScannedUrl) {
      if (JSON.parse(result.data).a !== undefined) {
        try{
          Alert.alert(
            'Payment Amount:',
            JSON.parse(result.data).a + ' LNR',
            [
              {text: 'Cancel', onPress: () => this.setState({ lastScannedUrl: null })},
              {text: 'Confirm', onPress: () => this.sendLNR(result.data)},
            ],
            {cancelable: true},
          );
          this.setState({ lastScannedUrl: result.data });
        } catch(e) {
          console.error(e)
        }
      }
    }
  }

  render() {
    return (
      <Shell h={windowHeight} w={windowWidth}>
        {
          this.state.fontLoaded ? (
            this.state.hasCameraPermission === null
              ? <Text>Requesting for camera permission</Text>
              : this.state.hasCameraPermission === false
                ? <Text style={{ color: '#000' }}>
                    Camera permission is not granted
                  </Text>
                : <Shell h={windowHeight} w={windowWidth}>
                    <StyledBuffer />
                    <StyledBanner>
                      <StyledTitle>
                        Scan a QR
                      </StyledTitle>
                    </StyledBanner>
                    <StyledQRWorkspace>
                      <BarCodeScanner
                        onBarCodeScanned={this._handleBarCodeRead}
                        style={[styles.container]}
                      >
                        <LayerTop f={qrVBuff} />
                        <LayerCenter f={qrSize}>
                          <LayerLeft />
                          <Focal>
                            <StyledImage
                              source={require('./assets/img/frame.png')}
                            />
                          </Focal>
                          <LayerRight />
                        </LayerCenter>
                        <LayerBottom f={qrVBuff} />
                      </BarCodeScanner>
                    </StyledQRWorkspace>
                    <StyledBanner />
                  </Shell>
          ) : null
        }
      </Shell>
    );
  }
}

class PricesWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    return (
      <Shell h={windowHeight} w={windowWidth}>
        {
          this.state.fontLoaded ? (
            <Shell h={windowHeight} w={windowWidth}>
              <StyledBuffer />
              <StyledBanner>
                <StyledTitle>
                  Prices
                </StyledTitle>
              </StyledBanner>
              <StyledWorkspace>
                <StyledScroll disableContainerEvents w={windowWidth}>
                  <IPad />
                  <ChartBackdropT w={chartainw} h={chartainh} pointerEvents="none">
                    <VictoryChart width={chartainw * 1.27} height={chartainh * 1.40}>
                      <VictoryLabel text="USD/EUR" x={chartainw * 0.3} y={chartainh * 0.31} textAnchor="middle"/>
                      <VictoryLabel text="(Converting USD instead of LNR" x={chartainw * 0.5} y={chartainh * 0.38} textAnchor="middle"/>
                      <VictoryLabel text="since no historical data exists yet)" x={chartainw * 0.513} y={chartainh * 0.45} textAnchor="middle"/>
                      <VictoryLabel text={e_dat[e_dat.length - 1].y.toFixed(3).toString()} x={chartainw * 0.99} y={chartainh * 0.31} textAnchor="middle"/>
                      <VictoryAxis
                        tickCount={1}
                        tickFormat={() => ''}
                        style={{ axis: {stroke: "none"} }}
                      />
                      <VictoryAxis
                        dependentAxis
                        tickCount={1}
                        tickFormat={() => ''}
                        style={{ axis: {stroke: "none"} }}
                      />
                      <VictoryArea
                        style={{
                          data: { stroke: '#00c300', fill: '#00c30040' },
                        }}
                        data={e_dat}
                        domain={{ y: [0.84, 0.94] }}
                      />
                    </VictoryChart>
                  </ChartBackdropT>
                  <ChartBackdrop w={chartainw} h={chartainh} pointerEvents="none">
                    <VictoryChart width={chartainw * 1.27} height={chartainh * 1.40}>
                      <VictoryLabel text="USD/JPY" x={chartainw * 0.3} y={chartainh * 0.31} textAnchor="middle"/>
                      <VictoryLabel text={y_dat[y_dat.length - 1].y.toFixed(3).toString()} x={chartainw * 0.99} y={chartainh * 0.31} textAnchor="middle"/>
                      <VictoryAxis
                        tickCount={1}
                        tickFormat={() => ''}
                        style={{ axis: {stroke: "none"} }}
                      />
                      <VictoryAxis
                        dependentAxis
                        tickCount={1}
                        tickFormat={() => ''}
                        style={{ axis: {stroke: "none"} }}
                      />
                      <VictoryArea
                        style={{
                          data: { stroke: '#999999', fill: '#99999940' },
                        }}
                        data={y_dat}
                        domain={{ y: [106, 116.8] }}
                      />
                    </VictoryChart>
                  </ChartBackdrop>
                  <ChartBackdrop w={chartainw} h={chartainh} pointerEvents="none">
                    <VictoryChart width={chartainw * 1.27} height={chartainh * 1.40}>
                      <VictoryLabel text="USD/GBP" x={chartainw * 0.3} y={chartainh * 0.31} textAnchor="middle"/>
                      <VictoryLabel text={p_dat[p_dat.length - 1].y.toFixed(3).toString()} x={chartainw * 0.99} y={chartainh * 0.31} textAnchor="middle"/>
                      <VictoryAxis
                        tickCount={1}
                        tickFormat={() => ''}
                        style={{ axis: {stroke: "none"} }}
                      />
                      <VictoryAxis
                        dependentAxis
                        tickCount={1}
                        tickFormat={() => ''}
                        style={{ axis: {stroke: "none"} }}
                      />
                      <VictoryArea
                        style={{
                          data: { stroke: '#4648e8', fill: '#4648e840' },
                        }}
                        data={p_dat}
                        domain={{ y: [0.72, 0.84] }}
                      />
                    </VictoryChart>
                  </ChartBackdrop>
                  <ChartBackdropB w={chartainw} h={chartainh} pointerEvents="none">
                    <VictoryChart width={chartainw * 1.27} height={chartainh * 1.40}>
                      <VictoryLabel text="USD/CHF" x={chartainw * 0.3} y={chartainh * 0.31} textAnchor="middle"/>
                      <VictoryLabel text={f_dat[f_dat.length - 1].y.toFixed(3).toString()} x={chartainw * 0.99} y={chartainh * 0.31} textAnchor="middle"/>
                      <VictoryAxis
                        tickCount={1}
                        tickFormat={() => ''}
                        style={{ axis: {stroke: "none"} }}
                      />
                      <VictoryAxis
                        dependentAxis
                        tickCount={1}
                        tickFormat={() => ''}
                        style={{ axis: {stroke: "none"} }}
                      />
                      <VictoryArea
                        style={{
                          data: { stroke: '#575757', fill: '#57575740' },
                        }}
                        data={f_dat}
                        domain={{ y: [0.94, 1.04] }}
                      />
                    </VictoryChart>
                  </ChartBackdropB>
                  <ChartBottom h={18} w={chartainw} />
                  <IPad />
                </StyledScroll>
              </StyledWorkspace>
              <StyledBanner />
            </Shell>
          ) : null
        }
      </Shell>
    );
  }
}

class AccountWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
      pin: '',
      balance: null,
      u: null,
      isModalVisible: false,
      showQR: false,
      plsgibmoneyz: '',
      local: 1,
    };
  }

  _changePin = () => {
    this.props.navigation.navigate('ChPin');
  }

  tHist = () => {
    this.props.navigation.navigate('History');
  }

  bal = () => {
    db.collection('users').doc(this.state.u)
      .onSnapshot(function(doc) {
        this.setState({ balance: doc.data().balance });
      }.bind(this));
  }

  async componentDidMount() {
    await Font.loadAsync({
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    });

    const user = await AsyncStorage.getItem('userToken');
    this.setState({ u: user })

    db.collection('users').doc(user)
      .onSnapshot(function(doc) {
        this.setState({ pin: doc.data().pin });
        this.setState({ balance: doc.data().balance });
      }.bind(this));

    this.setState({ fontLoaded: true });
  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }

  proceed = () => {
    this.toggleModal;
    this.setState({ showQR: true })
  }

  closeEverything = () => {
    this.setState({ isModalVisible: false });
    this.setState({ showQR: false });
  }

  requestQR = text => {
    this.setState({ plsgibmoneyz: text });
  };

  renderNavBar = () => {
    return (
      <View style={{height: 58, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: '#f5f5f5', fontFamily: 'open-sans-semibold', fontSize: 18}}>
          Sean  Rhee
        </Text>
      </View>
    )
  }

  native = () => {
    Alert.alert(
      'Set Native Currency',
      'What is the local currency? (currently limited in beta)',
      [
        {text: 'USD', onPress: () => this.setState({ local: 0 })},
        {text: 'KRW', onPress: () => this.setState({ local: 1 })},
      ],
      {cancelable: false},
    )
  }

  charge = () => {
    Alert.alert(
      'Sorry,',
      "Unfortunately, LINE Rama doesn't currently support charging an account with real money",
      [
        {text: 'OK  :(', onPress: () => console.log()},
      ],
      {cancelable: false},
    )
  }

  email = () => {
    Alert.alert(
      'Email address',
      'seanr20112593@gmail.com',
      [
        {text: 'Change (not available in beta)', onPress: () => console.log()},
        {text: 'OK', onPress: () => console.log()}
      ],
      {cancelable: false},
    )
  }

  phone = () => {
    Alert.alert(
      'Phone Number',
      '010-8236-1682',
      [
        {text: 'Change (not available in beta)', onPress: () => console.log()},
        {text: 'OK', onPress: () => console.log()}
      ],
      {cancelable: false},
    )
  }

  notif = () => {
    Alert.alert(
      'Notification Settings',
      'Enable Notifications?',
      [
        {text: 'Deny', onPress: () => console.log()},
        {text: 'Allow', onPress: () => console.log()},
      ],
      {cancelable: false},
    )
  }

  renderContent = () => {
    return (
      <View>
        <AccHolder w={windowWidth} h={cheight + 4}>
          <AccountTitle>
            Financing
          </AccountTitle>
        </AccHolder>
        <StyledClick w={windowWidth} h={cheight - 3}>
          <Ionicons name='ios-cash' size={23} color='#696969' style={{marginRight: 12}}/>
          {
            (this.state.local === 1) ? (
              <DispAccInfo>
                Balance: {parseFloat(this.state.balance).toFixed(2)} LNR ({(this.state.balance * 1245.8).toFixed(2)} KRW)
              </DispAccInfo>
            ) : (
              <DispAccInfo>
                Balance: {parseFloat(this.state.balance).toFixed(2)} LNR ({(this.state.balance * 1.05).toFixed(2)} USD)
              </DispAccInfo>
            )
          }
        </StyledClick>
        <StyledClick w={windowWidth} h={cheight - 3} onPress={this.native}>
          <Ionicons name='md-globe' size={23} color='#696969' style={{marginRight: 12}}/>
          <DispAccInfo>
            Native Currency
          </DispAccInfo>
        </StyledClick>
        <StyledClick w={windowWidth} h={cheight - 3} onPress={this.charge}>
          <Ionicons name='ios-add-circle-outline' size={23} color='#696969' style={{marginRight: 12}}/>
          <DispAccInfo>
            Charge Account
          </DispAccInfo>
        </StyledClick>
        <AccHolder w={windowWidth} h={cheight + 4}>
          <AccountTitle>
            Account & Security
          </AccountTitle>
        </AccHolder>
        <StyledClick w={windowWidth} h={cheight - 3} onPress={this.email}>
          <Ionicons name='md-mail' size={23} color='#696969' style={{marginRight: 12}}/>
          <DispAccInfo>
            Email
          </DispAccInfo>
        </StyledClick>
        <StyledClick w={windowWidth} h={cheight - 3} onPress={this.phone}>
          <Ionicons name='ios-call' size={23} color='#696969' style={{marginRight: 12}}/>
          <DispAccInfo>
            Phone Number
          </DispAccInfo>
        </StyledClick>
        <StyledClick w={windowWidth} onPress={this._changePin} h={cheight}>
          <Ionicons name='md-keypad' size={23} color='#696969' style={{marginRight: 12}}/>
          <DispAccInfo>
            Set PIN
          </DispAccInfo>
        </StyledClick>
        <AccHolder w={windowWidth} h={cheight + 4}>
          <AccountTitle>
            Other
          </AccountTitle>
        </AccHolder>
        <StyledClick w={windowWidth} h={cheight - 3} onPress={this.notif}>
          <Ionicons name='ios-notifications' size={23} color='#696969' style={{marginRight: 12}}/>
          <DispAccInfo>
            Notifications
          </DispAccInfo>
        </StyledClick>
        <StyledClick w={windowWidth} onPress={this.toggleModal} h={cheight - 3}>
          <Ionicons name='ios-barcode' size={23} color='#696969' style={{marginRight: 12}}/>
          <DispAccInfo>
            My QR
          </DispAccInfo>
        </StyledClick>
        <StyledClick w={windowWidth} onPress={this.tHist} h={cheight - 3}>
          <Ionicons name='md-time' size={23} color='#696969' style={{marginRight: 12}}/>
          <DispAccInfo>
            Transaction History
          </DispAccInfo>
        </StyledClick>
        <Exit w={windowWidth} h={cheight - 3} onPress={this._signOutAsync}>
          <ExitText>
            Log Out
          </ExitText>
        </Exit>
      </View>
    )
  }

  render() {
    return (
      <Shell h={windowHeight} w={windowWidth}>
        {
          this.state.fontLoaded ? (
            <Shell h={windowHeight} w={windowWidth}>
              <NavigationEvents
                onDidFocus={this.bal}
              />
              <Modal isVisible={this.state.isModalVisible}>
                <AuthLoadView>
                  <ModalTab w={250} h={160}>
                    <InputHolder>
                      <Text>
                        Enter LNR Amount
                      </Text>
                      <QRInput
                        underlineColorAndroid='transparent'
                        autoCapitalize='none'
                        keyboardType='number-pad'
                        onChangeText={this.requestQR}
                      />
                    </InputHolder>
                    <CancelOKHold>
                      <CloseQR onPress={this.toggleModal}>
                        <VText>Cancel</VText>
                      </CloseQR>
                      <GoToQR onPress={this.proceed}>
                        <VText>Continue</VText>
                      </GoToQR>
                    </CancelOKHold>
                  </ModalTab>
                </AuthLoadView>
              </Modal>
              <Modal isVisible={this.state.showQR}>
                <AuthLoadView>
                  <ModalTab w={250} h={280}>
                    <ImgHold d={250}>
                      <Image
                        source={require('./assets/img/example.png')}
                      />
                    </ImgHold>
                    <CloseNextQR onPress={this.closeEverything}>
                      <VText>Done</VText>
                    </CloseNextQR>
                  </ModalTab>
                </AuthLoadView>
              </Modal>
              <StyledBuffer />
              <StyledBanner>
                <StyledTitle>
                  Account Info
                </StyledTitle>
              </StyledBanner>
              <StyledWorkspace>
                <ReactNativeParallaxHeader
                  headerMinHeight={58}
                  headerMaxHeight={240}
                  extraScrollHeight={20}
                  navbarColor='#50d97b'
                  alwaysShowTitle={false}
                  alwaysShowNavBar={false}
                  backgroundImage={require('./assets/img/profile.png')}
                  backgroundImageScale={1}
                  renderNavBar={this.renderNavBar}
                  renderContent={this.renderContent}
                  containerStyle={{flex: 1}}
                  contentContainerStyle={{flexGrow: 1}}
                  innerContainerStyle={{flex: 1}}
                />
              </StyledWorkspace>
              <StyledBanner />
            </Shell>
          ) : null
        }
      </Shell>
    );
  }
}


class Pindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
      pin: null,
      correct: null,
      h: null,
      NewPin: false,
      input: null,
    };
  }

  hide = () => {
    this.setState({ isModalVisible: false });
  }

  check = () => {
    if (parseInt(this.state.pin) === parseInt(this.state.correct)) {
      this.setState({ isModalVisible: true });
    } else {
      Alert.alert(
        'Wrong PIN',
        'Please enter the correct PIN',
        [
          {text: 'ok'}
        ],
        {cancelable: false},
      );
    }
  }

  async componentDidMount() {
    await Font.loadAsync({
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    });

    const name = await AsyncStorage.getItem('userToken')

    db.collection('users').doc(name)
      .onSnapshot(function(doc) {
        this.setState({ correct: doc.data().pin });
      }.bind(this));

    this.setState({ fontLoaded: true });
  }

  static navigationOptions = {
    title: 'Change PIN'
  };

  go = () => {
    this.props.navigation.navigate('App');
  }

  takeMeHome = () => {
    this.setState({ isModalVisible: false });
    this.props.navigation.navigate('App');
  }

  setNew = () => {
    if (this.state.input.length === 4) {
      db.collection('users').doc('seanr').update({
        pin: this.state.input,
      });
      this.setState({ isModalVisible: false });
      this.props.navigation.navigate('App');
    } else {
      Alert.alert(
        "Error",
        "PIN must be 4 digits long",
        [
          {text: 'OK', onPress: () => console.log()}
        ],
        {cancelable: false},
      )
    }
  }

  handleInput = text => {
    if (isNaN(text)) {
      Alert.alert(
        "Sorry",
        "Please only enter numbers",
        [
          {text: 'ok', onPress: () => console.log()}
        ],
        {cancelable: false},
      )
    } else {
      this.setState({ input: text });
    }
  };

  render() {
    return (
      <Shell h={windowHeight} w={windowWidth}>
        {
          this.state.fontLoaded ? (
            <Shell h={windowHeight} w={windowWidth}>
              <Modal isVisible={this.state.isModalVisible}>
                <AuthLoadView>
                  <ModalTab w={250} h={160}>
                    <InputHolder>
                      <Text>
                        New PIN
                      </Text>
                      <QRInput
                        underlineColorAndroid='transparent'
                        autoCapitalize='none'
                        keyboardType='number-pad'
                        maxLength={4}
                        onChangeText={this.handleInput}
                      />
                    </InputHolder>
                    <CancelOKHold>
                      <CloseQR onPress={this.takeMeHome}>
                        <VText>Cancel</VText>
                      </CloseQR>
                      <GoToQR onPress={this.setNew}>
                        <VText>Done</VText>
                      </GoToQR>
                    </CancelOKHold>
                  </ModalTab>
                </AuthLoadView>
              </Modal>
              <StyledWorkspace>
                <PinHolder>
                  <EnterPin>
                    Enter Current PIN
                  </EnterPin>
                  <PinInput
                    style={{justifyContent: 'space-between', alignSelf: 'stretch', paddingBottom: 70, paddingTop: 20}}
                    ref={(input) => {
                      this.pin = input;
                    }}
                    autoFocus={true}
                    text=" "
                    pinLength={4}
                    pinItemStyle={{width: 50, height: 50, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 2, borderColor: '#696969'}}
                    pinItemProps={{keyboardType: 'number-pad', returnKeyType: 'done', secureTextEntry: false}}
                    placeholder={''}
                    onPinCompleted={(pin) => {
                      this.setState({pin: pin});
                    }}
                    containerStyle={{backgroundColor: 'transparent'}}
                    containerPinStyle={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      marginTop: 20,
                    }}
                  />
                  <ConfirmPin onPress={this.check}>
                    <VText>
                      Confirm
                    </VText>
                  </ConfirmPin>
                  <CancelHolder onPress={this.go}>
                    <CancelText>
                      Cancel
                    </CancelText>
                  </CancelHolder>
                </PinHolder>
                <PINBuffer />
              </StyledWorkspace>
            </Shell>
          ) : null
        }
      </Shell>
    );
  }
}

class HistoryWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
      user: null,
      data: [],
    };

    this.key = 0;
  }

  _retrieveUser = async () => {
    try {
      const username = await AsyncStorage.getItem('userToken');
      this.setState({ user: username });
      db.collection('users').doc(this.state.user)
        .onSnapshot(function(doc) {
          this.setState({ data: doc.data().history });
          console.log(this.state.data)
        }.bind(this));
    } catch(err) {
      console.log('No user', err);
    }
  }

  update = () => {
    db.collection('users').doc(this.state.user)
      .onSnapshot(function(doc) {
        this.setState({ data: doc.data().history });
        console.log(this.state.data)
      }.bind(this));
  }

  async componentDidMount() {
    await Font.loadAsync({
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    });

    this._retrieveUser();

    this.setState({ fontLoaded: true });
  }

  home = () => {
    this.props.navigation.navigate('App');
  }

  timeConverter = (s) => {
    console.log(s);
    var a = new Date(s * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' 2019 ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  static navigationOptions = {
    title: 'Transaction History'
  };

  render() {
    return (
      <Shell h={windowHeight} w={windowWidth}>
        {
          this.state.fontLoaded ? (
            <Shell h={windowHeight} w={windowWidth}>
              <NavigationEvents
                onDidFocus={this.update}
              />
              <StyledWorkspace>
                <ScrollView>
                  {
                    this.state.data.map((l, i) => (
                      <StyledT h={cheight} w={windowWidth} onPress={console.log('gay')} key={i}>
                        <DispAccInfo>
                          {l.time.toDate().toString().substring(0, 24)}
                        </DispAccInfo>
                        <DispAccInfo>
                          {l.from} -> {l.amount} LNR -> {l.to}
                        </DispAccInfo>
                      </StyledT>
                    ))
                  }
                </ScrollView>
              </StyledWorkspace>
              <GoHome w={windowWidth} onPress={this.home}>
                <VText>
                  Home
                </VText>
              </GoHome>
              <StyledBanner />
            </Shell>
          ) : null
        }
      </Shell>
    );
  }
}

const getTabBarIcon = (navigation, focused, tintColor) => {
  const { routeName } = navigation.state;
  let IconComponent = Ionicons;
  let iconName;
  if (routeName === 'QR') {
    iconName = "ios-qr-scanner";
  } else if (routeName ==='Prices') {
    iconName = "ios-trending-up"
  } else if (routeName === 'Account') {
    iconName = "ios-card";
  }

  return <IconComponent name = {iconName} size={25} color={tintColor} />;
};

const AuthStack = createStackNavigator(
  {
    SignIn: {screen: SignInWindow}
  },
);

const VerifyStack = createStackNavigator(
  {
    Verification: {screen: VerificationWindow}
  },
);

const HistoryStack = createStackNavigator(
  {
    History: {screen: HistoryWindow}
  },
);

const ChangeStack = createStackNavigator(
  {
    PinChange: {screen: Pindow}
  },
)

const TabNavigator = createMaterialTopTabNavigator(
  {
    QR: { screen: QRWindow },
    Prices: { screen: PricesWindow },
    Account: { screen: AccountWindow },
  },
  {
    tabBarPosition: 'bottom',
    initialRouteName: 'QR',
    swipeEnabled: true,
    animationEnabled: true,
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) =>
        getTabBarIcon(navigation, focused, tintColor),
    }),
    tabBarOptions: {
      activeTintColor: '#00c300',
      inactiveTintColor: '#000000',
      showIcon: true,
      indicatorStyle: {
        opacity: 0,
      },
      tabStyle: {
        height: tabHeight,
      },
      style: {
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4',
        paddingTop: 7,
      },
    },
  },
);

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: TabNavigator,
    Auth: AuthStack,
    Verify: VerifyStack,
    History: HistoryStack,
    ChPin: ChangeStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));

const Shell = styled.View`
  display: flex;
  backgroundColor: rgb(15,15,15);
  position: absolute;
  top: 0;
  left: 0;
  height: ${props => props.h};
  width: ${props => props.w};
`;

const AuthLoadView = styled.View`
  flex: 1;
  alignItems: center;
  justifyContent: center;
`;

const AuthLandingPage = styled.View`
  flex: 1;
  alignItems: flex-start;
  justifyContent: flex-start;
  backgroundColor: #ebebeb;
  paddingLeft: 10%;
  paddingTop: 6%;
`;

const StyledInput = styled.TextInput`
  margin: 25px;
  padding: 10px;
  height: 40px;
  width: 200px;
  borderColor: #000000;
  borderWidth: 1px;
  borderRadius: 2px;
`;

const StyledSubmit = styled.TouchableOpacity`
  backgroundColor: #00c300;
  padding: 10px;
  margin: 25px;
  alignItems: center;
  height: 40px;
  width: 120px;
  borderRadius: 6px;
`;

const StyledT = styled.TouchableOpacity`
  backgroundColor: #f5f5f5;
  borderBottomWidth: 1px;
  borderColor: #dcdcdc;
  paddingLeft: 25px;
  height: ${props => props.h};
  width: ${props => props.w};
  alignItems: flex-start;
  justifyContent: center;
  display: flex;
  flexDirection: column;
`;

const CancelHolder = styled.TouchableOpacity`
  padding: 10px;
`;

const CancelText = styled.Text`
  fontFamily: 'open-sans';
  fontSize: 11;
  color: #696969;
`;

const AmountNote = styled.View`
  height: 30;
  width: 350;
  textAlign: left;
  paddingLeft: 7px;
  paddingTop: 9px;
`;

const AmountTitle = styled.Text`
  fontFamily: 'open-sans';
  fontSize: 12;
  color: #9c9c9c;
`;

const AmountInput = styled.TextInput`
  fontFamily: 'open-sans-semibold';
  height: 75;
  flex: 5;
  borderRightWidth: 1px;
  borderColor: #525252;
  color: #00c300;
  fontSize: 34;
  textAlign: right;
  paddingRight: 20px;
`;

const AmountDenom = styled.View`
  height: 75;
  flex: 2;
  alignItems: center;
  justifyContent: center;
`;

const DenomText = styled.Text`
  fontFamily: 'open-sans-semibold';
  color: #00c300;
  fontSize: 36;
`;

const BalanceTitle = styled.View`
  flex: 1;
  alignItems: center;
  justifyContent: center;
  paddingTop: 10px;
`;

const BalanceDisplay = styled.View`
  flex: 4;
  alignItems: center;
  justifyContent: center;
  marginBottom: 40px;
`;

const BalanceBox = styled.View`
  height: 90;
  width: 280;
  alignItems: center;
  justifyContent: center;
  borderWidth: 2px;
  borderRadius: 6px;
  borderColor: #525252;
`;

const CBText = styled.Text`
  fontFamily: 'open-sans-semibold';
  fontSize: 30;
  color: #525252;
`;

const LargeBalance = styled.Text`
  fontFamily: 'open-sans-semibold';
  fontSize: 42;
  color: #00c300;
`;

const Verify = styled.TouchableOpacity`
  flex: 4;
  backgroundColor: #00c300;
  alignItems: center;
  justifyContent: center;
  width: ${props => props.w};
  paddingBottom: 13;
`;

const GoHome = styled.TouchableOpacity`
  flex: 5.3;
  backgroundColor: #00c300;
  alignItems: center;
  justifyContent: center;
  width: ${props => props.w};
  paddingBottom: 15;
`;

const VText = styled.Text`
  fontFamily: 'open-sans-semibold';
  color: #f8f8f8;
  fontSize: 20;
  alignItems: center;
`;

const PinHolder = styled.View`
  display: flex;
  flex: 1;
  backgroundColor: #ebebeb;
  alignItems: center;
  justifyContent: center;
  padding: 60px;
`;

const EnterPin = styled.Text`
  fontFamily: 'open-sans-semibold';
  fontSize: 42;
  color: #525252;
`;

const PINBuffer = styled.View`
  flex: 1;
`;

const ConfirmPin = styled.TouchableOpacity`
  width: 170;
  height: 50;
  backgroundColor: #00c300
  alignItems: center;
  justifyContent: center;
  marginBottom: 15px;
`;

const ModalTab = styled.View`
  borderRadius: 10px;
  backgroundColor: #ebebeb;
  alignItems: center;
  justifyContent: center;
  width: ${props => props.w};
  height: ${props => props.h};
  display: flex;
  flexShrink: 0;
`;

const ModalTextArea = styled.View`
  flex: 3;
  alignItems: center;
  justifyContent: center;
`;

const CloseModal = styled.TouchableOpacity`
  flex: 2;
  backgroundColor: #00c300;
  width: 100%;
  alignItems: center;
  justifyContent: center;
  borderBottomRightRadius: 10px;
  borderBottomLeftRadius: 10px;
  borderBottomWidth: 1px;
`;

const CloseQR = styled.TouchableOpacity`
  flex: 1;
  backgroundColor: #00c300;
  height: 100%;
  alignItems: center;
  justifyContent: center;
`;

const CloseNextQR = styled.TouchableOpacity`
  backgroundColor: #00c300;
  height: 30px;
  alignItems: center;
  justifyContent: center;
  width: 100%;
  borderBottomRightRadius: 10px;
  borderBottomLeftRadius: 10px;
  borderBottomWidth: 1px;
`;

const GoToQR = styled.TouchableOpacity`
  flex: 1;
  backgroundColor: #00c300;
  height: 100%;
  alignItems: center;
  justifyContent: center;
  borderLeftWidth: 1px;
  borderColor: #009600;
`;

const CancelOKHold = styled.View`
  flex: 2;
  flexDirection: row;
  backgroundColor: #00c300;
  width: 100%;
  alignItems: center;
  justifyContent: center;
`;

const InputHolder = styled.View`
  flex: 2;
  backgroundColor: #f6f6f6;
  width: 100%;
  alignItems: center;
  justifyContent: center;
  padding: 14px;
`;

const QRInput = styled.TextInput`
  padding: 10px;
  height: 40px;
  width: 140px;
  borderColor: #525252;
  borderWidth: 1px;
  borderRadius: 5px;
`;

const ModalMessage = styled.Text`
  fontFamily: 'open-sans-semibold';
  color: #212121;
  fontSize: 18;
`;

const ChartBackdrop = styled.View`
  display: flex;
  alignItems: center;
  justifyContent: center;
  backgroundColor: #f6f6f6;
  height: ${props => props.h};
  width: ${props => props.w};
  borderTopColor: #d4d4d4;
  borderTopWidth: 1px;
`;

const ChartBackdropT = styled.View`
  display: flex;
  alignItems: center;
  justifyContent: center;
  backgroundColor: #f6f6f6;
  borderTopRightRadius: 18px;
  borderTopLeftRadius: 18px;
  height: ${props => props.h};
  width: ${props => props.w};
`;

const ChartBackdropB = styled.View`
  display: flex;
  alignItems: center;
  justifyContent: center;
  backgroundColor: #f6f6f6;
  height: ${props => props.h};
  width: ${props => props.w};
  borderTopColor: #d4d4d4;
  borderTopWidth: 1px;
`;

const ChartBottom = styled.View`
  height: ${props => props.h};
  width: ${props => props.w};
  backgroundColor: #cecece;
  borderBottomRightRadius: 18px;
  borderBottomLeftRadius: 18px;
`;

const IPad = styled.View`
  height: 16px;
  backgroundColor: #ebebeb;
`;

const StyledScroll = styled.ScrollView.attrs(props => ({
  contentContainerStyle:{
      alignItems: 'center',
      justifyContent: 'center',
  }
}))`
  backgroundColor: #ebebeb;
  width: ${props => props.w}
`;

const AccountMain = styled.View`
  flex: 46;
  display: flex;
`;

const AccHolder = styled.View`
  height: ${props => props.h};
  borderTopWidth: 1px;
  borderColor: #cfcfcf;
  width: ${props => props.w};
  alignItems: flex-start;
  justifyContent: flex-end;
  paddingLeft: 37px;
  paddingBottom: 24px;
`;

const StyledClick = styled.TouchableOpacity`
  height: ${props => props.h};
  flexDirection: row;
  borderTopWidth: 1px;
  borderColor: #cfcfcf;
  width: ${props => props.w};
  alignItems: center;
  justifyContent: flex-start;
  paddingLeft: 37px;
`;

const Exit = styled.TouchableOpacity`
  height: ${props => props.h};
  backgroundColor: #00c300;
  width: ${props => props.w};
  alignItems: flex-start;
  justifyContent: center;
  paddingLeft: 37px;
`;

const DispAccInfo = styled.Text`
  fontFamily: 'open-sans';
  color: #696969;
  fontSize: 18;
`;

const ExitText = styled.Text`
  fontFamily: 'open-sans';
  color: #f8f8f8;
  fontSize: 18;
`;

const AccountTitle = styled.Text`
  fontFamily: 'open-sans-semibold';
  color: #404040;
  fontSize: 20;
`;

const GayView = styled.View`
  paddingLeft: 130px;
`;

const ImgHold = styled.View`
  width: ${props => props.d};
  height: ${props => props.d};
  padding: 16px;
  display: flex;
  alignItems: center;
  justifyContent: center;
`;

const StyledBuffer = styled.View`
  display: flex;
  flex: 2;
  backgroundColor: #f8f8f8;
`;

const StyledBanner = styled.View`
  display: flex;
  flex: 5;
  backgroundColor: #f8f8f8;
  alignItems: center;
  justifyContent: center;
  borderBottomWidth: 1;
  borderBottomColor: #d4d4d4;
`;

const StyledWorkspace = styled.View`
  display: flex;
  flex: 65;
  backgroundColor: #ebebeb;
  alignItems: center;
`;

const StyledQRWorkspace = styled.View`
  display: flex;
  flex: 65;
  backgroundColor: #000000;
`;

const StyledTitle = styled.Text`
  fontFamily: 'open-sans-semibold';
  fontSize: 21;
  color: #000000;
`;

const StyledQRTitle = styled.Text`
  fontFamily: 'open-sans-semibold';
  fontSize: 21;
  color: #f8f8f8;
`;

const SubmitText = styled.Text`
  fontFamily: 'open-sans';
  fontSize: 12;
  color: #f8f8f8;
`;

//  |                  |
// \|/ BAR CODE STUFF \|/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    height: windowHeight,
    width: windowWidth,
  },
});

const LayerTop = styled.View`
  display: flex;
  flex: ${props => props.f};
  backgroundColor: rgba(0, 0, 0, 0.6);
  alignItems: center;
  justifyContent: center;
`;

const LayerCenter = styled.View`
  flexDirection: row;
  flex: ${props => props.f};
`;

const LayerLeft = styled.View`
  flex: 1;
  backgroundColor: rgba(0, 0, 0, 0.6);
`;

const Focal = styled.View`
  display: flex;
  flex: 4;
  justifyContent: center;
  alignItems: center;
`;

const LayerRight = styled.View`
  flex: 1;
  backgroundColor: rgba(0, 0, 0, 0.6);
`;

const LayerBottom = styled.View`
  flex: ${props => props.f};
  backgroundColor: rgba(0, 0, 0, 0.6);
  marginBottom: 4;
`;

const StyledImage = styled.Image`
  width: 100%;
  height: 100%;
`;

// /|\ BAR CODE STUFF /|\
//  |                  |
