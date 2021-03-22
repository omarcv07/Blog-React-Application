import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { deletePost } from '../graphql/mutations';

const DeletePost = (props) => {
    const { post } = props;

    const handleDeletePost = async postId => {
        try {
            await API.graphql(graphqlOperation(deletePost, { input: { id: postId } }))
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <button onClick={() => handleDeletePost(post.id)}>Delete</button>
    );
}

export default DeletePost;