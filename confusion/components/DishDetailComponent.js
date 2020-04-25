import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import DatePicker from 'react-native-datepicker'
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite,postComment } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment)  => dispatch(postComment(dishId, rating, author, comment))
})


function RenderDish(props) {

    const dish = props.dish;
    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        },{
            dialogTitle: 'Share ' + title
        })
    }

        if (dish != null) {
            return(
                <Card
            featuredTitle={dish.name}
            image={{uri: baseUrl + dish.image}}>
                <Text style={{margin: 10}}>
                    {dish.description}
                </Text>
                <Icon
                    raised
                    reverse
                    name={ props.favorite ? 'heart' : 'heart-o'}
                    type='font-awesome'
                    color='#f50'
                    onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                    />
                <Icon
                        raised
                        reverse
                        name={'pencil'}
                        type='font-awesome'
                        color='#0000FF'
                        onPress={() => props.onPress1()}
                    />
                     <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
            </Card>
            );
        }
        else {
            return(<View></View>);
        }
}
function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Card title='Comments' >
        <FlatList 
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
        </Card>
    );
}
class Dishdetail extends Component {

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    constructor(props) {
        super(props);

        this.state = {
            rating: 3,
            author: '',
            comment: '',
            showModal: false
        }
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    submitModal() {
        const { dishId } = this.props.route.params;
        this.props.postComment(dishId, this.state.rating, 
            this.state.author, this.state.comment);
        this.setState({
            rating: 3,
            author: '',
            comment: '',
            showModal: false
        });
    }
    

    static navigationOptions = {
        title: 'Dish Details'
    };
   
    render() {
        const dishId = this.props.route.params.dishId;
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    onPress1={() => this.toggleModal()}
                    />
                    
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType={"slide"} transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => this.toggleModal()}
                    onRequestClose={() => this.toggleModal()}>
                    <View style = {styles.modal}>
                        <Text style = {styles.modalTitle}>Your Reservation</Text>
                        <Rating
                            showRating
                            onFinishRating={(r) => this.setState({rating: r})}
                            style={{ paddingVertical: 10 }}
                            />
                        <Input
                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                            onChangeText={text => this.setState({author: text})}
                            leftIconContainerStyle={{marginRight: 10}}
                        />
                        <Input
                            placeholder='Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                            onChangeText={text => this.setState({comment: text})}
                            leftIconContainerStyle={{marginRight: 10}}
                        />
                        <View style = {styles.modalText}>
                            <Button 
                                style = {{margin: 10}}
                                onPress = {() =>{this.submitModal()}}
                                color="#512DA8"
                                title="Submit" 
                                />
                        </View>
                        <View style = {styles.modalText}>
                            <Button 
                                style = {{margin: 10}}
                                onPress = {() =>{this.toggleModal()}}
                                color="#868e96"
                                title="Cancel" 
                                />
                        </View>
                    </View>
              
                </Modal>
            </ScrollView>
            
        );
    }
}


const styles = StyleSheet.create({
    buttonRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row'
    },
    modal: {
        justifyContent: 'center',
        margin: 20
     },
     modalTitle: {
         fontSize: 24,
         fontWeight: 'bold',
         backgroundColor: '#512DA8',
         textAlign: 'center',
         color: 'white',
         marginBottom: 20
     },
     modalText: {
         margin: 10
     }
})
export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);