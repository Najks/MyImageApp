import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/authContext';

export default function DetailPhotoScreen({ route, navigation }) {
  const { user } = useAuth();
  const { photo: propPhoto } = route.params;
  const [photo, setPhoto] = useState(propPhoto);
  const [likes, setLikes] = useState(propPhoto.likes);
  const [dislikes, setDislikes] = useState(propPhoto.dislikes);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [isDislikedByUser, setIsDislikedByUser] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:3001/comments/image/${photo._id}`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    const fetchPhotoDetails = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:3001/photos/${photo._id}`);
        setPhoto(response.data);
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setIsLikedByUser(response.data.likesBy.includes(user._id));
        setIsDislikedByUser(response.data.dislikesBy.includes(user._id));
      } catch (error) {
        console.error('Error fetching photo details:', error);
      }
    };

    fetchComments();
    fetchPhotoDetails();
  }, [photo._id]);

  const handleLike = async () => {
    if (isLikedByUser) {
      Alert.alert('You have already liked this photo.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`http://10.0.2.2:3001/photos/${photo._id}/like/${user._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes); // Posodobi nevšečke, če so bili odstranjeni
      setIsLikedByUser(true);
      setIsDislikedByUser(false);
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleDislike = async () => {
    if (isDislikedByUser) {
      Alert.alert('You have already disliked this photo.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`http://10.0.2.2:3001/photos/${photo._id}/dislike/${user._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDislikes(response.data.dislikes);
      setLikes(response.data.likes); // Posodobi všečke, če so bili odstranjeni
      setIsLikedByUser(false);
      setIsDislikedByUser(true);
    } catch (error) {
      console.error('Error disliking photo:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`http://10.0.2.2:3001/comments`, {
        text: comment,
        image: photo._id,
        author: user._id, // Dodajte avtorja
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComment('');
      const response = await axios.get(`http://10.0.2.2:3001/comments/image/${photo._id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: `http://10.0.2.2:3001${photo.path}` }} style={styles.image} />
      <Text style={styles.title}>{photo.name}</Text>
      <Text>Likes: {likes}</Text>
      <Text>Dislikes: {dislikes}</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton} disabled={isLikedByUser}>
          <Text style={styles.actionButtonText}>{isLikedByUser ? 'Liked' : 'Like'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDislike} style={styles.actionButton} disabled={isDislikedByUser}>
          <Text style={styles.actionButtonText}>{isDislikedByUser ? 'Disliked' : 'Dislike'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={comments}
        keyExtractor={(comment) => comment._id}
        renderItem={({ item: comment }) => (
          <View style={styles.commentItem}>
            <Text>{comment.text}</Text>
            <Text style={styles.commentAuthor}>- {comment.author.username}</Text>
          </View>
        )}
      />
      <View style={styles.commentContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment"
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.commentButton}>
          <Text style={styles.commentButtonText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  actionButton: {
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#2089dc',
    borderRadius: 5,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  commentInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: '#2089dc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  commentButtonText: {
    color: '#fff',
  },
  commentItem: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  commentAuthor: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
  },
});
