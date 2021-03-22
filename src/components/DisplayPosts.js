import React, { useEffect, useState, Component } from 'react';
import { listPosts } from '../graphql/queries';
import { onCreateComment, onCreateLike, onCreatePost, onDeletePost, onUpdatePost } from '../graphql/subscriptions';
import { API , Auth, graphqlOperation } from 'aws-amplify';
import DeletePost from './DeletePost';
import EditPost from './EditPost';
import CreateCommentPost from './CreateCommentPost';
import UsersWhoLikedPost from './UsersWhoLikedPost';
import CommentPost from './CommentPost';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import { createLike } from '../graphql/mutations';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';

const DisplayPosts = () => {

    const [posts, setPosts] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [postLikedBy, setPostLikedBy] = useState([]);
    const [isHovering, setIsHovering] = useState(false);
    const [user, setUser] = useState({ ownerId: '', ownerUsername: '' });

    useEffect(() => {
        getPosts();
        const createPostListener = API.graphql(graphqlOperation(onCreatePost))
            .subscribe({
                next: postData => {
                    const newPost = postData.value.data.onCreatePost;
                    const prevPosts = posts.filter(post => post.id !== newPost.id);

                    const updatedPosts = [newPost, ...prevPosts];

                    setPosts(updatedPosts);
                }
        });

        const deletePostListener = API.graphql(graphqlOperation(onDeletePost))
            .subscribe({
                next: postData => {
                    const deletedPost = postData.value.data.onDeletePost;
                    const updatedPosts = posts.filter(post => post.id !== deletedPost.id);
                    
                    setPosts(updatedPosts);
                }
        });

        const updatePostListener = API.graphql(graphqlOperation(onUpdatePost))
            .subscribe({
                next: postData => {
                    const updatePost = postData.value.data.onUpdatePost;
                    const index = posts.find(post => post.id === updatePost.id);
                    const updatePosts = [...posts.slice(0, index), updatePost, ...posts.slice(index + 1)];

                    setPosts(updatePosts);
                }
        });

        const createPostCommentListener = API.graphql(graphqlOperation(onCreateComment))
            .subscribe({
                next: commentData => {
                    const createdComment = commentData.value.data.onCreateComment;
                    let postData = [...posts]

                    postData.forEach(post => {
                        if (createdComment.post.id === post.id) {
                            post.comments.items.push(createdComment);
                        }
                    });

                    setPosts(postData);
                }
        });

        const createPostLikeListener = API.graphql(graphqlOperation(onCreateLike))
        .subscribe({
            next: likeData => {
                const createdLike = likeData.value.data.onCreateLike;
                let postData = [...posts];

                postData.forEach(post => {
                    if (createdLike.post.id === post.id) {
                        post.likes.items.push(createdLike);
                    }
                });

                setPosts(postData);
            }
        });

        return () => {
            createPostListener.unsubscribe();
            deletePostListener.unsubscribe();
            updatePostListener.unsubscribe();
            createPostCommentListener.unsubscribe();
            createPostLikeListener.unsubscribe();
        }
    }, [posts]);

    useEffect(() => {
        getUser();
    }, [user])

    const getUser = async () => {
        try {
            const user = await Auth.currentUserInfo();
            if (user) {
                setUser({ 
                    ownerId: user.attributes.sub, 
                    ownerUsername: user.username 
                });
            }
        } catch(error) {
            console.error(error);
        }
    }

    const getPosts = async () => {
        try {
            const result = await API.graphql(graphqlOperation(listPosts));

            setPosts(result.data.listPosts.items);
        } catch(error) {
            console.error(error);
        }
    }

    const likedPost = (postId) => {
        for (let post of posts) {
            if (post.id === postId) {
                if (post.postOwnerId === user.ownerId) return true;
                for (let like of post.likes.items) {
                    if (like.likeOwnerId === user.ownerId) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    const handleLike = async (postId) => {
        const liked = await likedPost(postId)
        console.log("likedPost(postId)",likedPost(postId))
        console.log("likedPost(postId)",liked)
        if (likedPost(postId)) return setErrorMsg("Can't Like Your Own Post")
        else {
            const input = { numberLikes: 1, likeOwnerId: user.ownerId, likeOwnerUsername: user.ownerUsername, likePostId: postId }
            try {   
                await API.graphql(graphqlOperation(createLike, { input } ))
            } catch(error) {
                console.error(error)
            }
        }
    }

    const handleMouseHover = async postId => {
        setIsHovering(!isHovering);

        let innerLikes = postLikedBy;

        for (let post of posts) {
            if (post.id === postId) {
                for (let like of post.likes.items) {
                    innerLikes.push(like.likeOwnerUsername);
                }
            }

            setPostLikedBy(innerLikes);
        }
        console.log("pOST LIKED BY ", postLikedBy)
    }

    const handleMouseHoverLeave = async () => {
        setIsHovering(false);
        setPostLikedBy([]);
    }

    return posts.map(post => {
        return (
            <div className='posts' style={rowStyle} key={post.id}>
                <h1>{post.postTitle}</h1>
                <span  style={{ fontStyle: 'italic', color: '#0ca5e297' }}>
                    Wrote by: {post.postOwnerUsername}
                    {' on'}
                    <time style={{ fontStyle: 'italic' }}>
                        {' '}
                        {new Date(post.createdAt).toDateString()}
                    </time>
                </span>

                <p>{post.postBody}</p>

                <br />
                <span>
                    {post.postOwnerId === user.ownerId && <>
                            <DeletePost post={post} />
                            <EditPost post={post} />
                        </>
                    }
                    
                    <span>
                        <p className='alert'>{post.postOwnerId === user.ownerId && errorMsg}</p>
                        <p 
                            className='like-button'
                            
                            style={{ color: (post.likes.items.length > 0) ? 'blue' : 'gray', width: '33px' }}
                            onMouseEnter={() => handleMouseHover(post.id)} 
                            onMouseLeave={() => handleMouseHoverLeave()}
                            onClick={() => handleLike(post.id)}
                            ><ThumbUpAltIcon/>{post.likes.items.length}</p>
                    </span>
                </span>
                {isHovering ? 
                    <div className='users-liked'>
                        {postLikedBy.length === 0 ? "Liked by no one" : "Liked by: "}
                        {postLikedBy.length === 0 ? <SentimentVeryDissatisfiedIcon /> : <UsersWhoLikedPost data={postLikedBy} />}
                    </div>
                    :
                    null
                }

                <span>
                    <CreateCommentPost postId={post.id} />
                    {post.comments.items && post.comments.items.length > 0 && 
                        <span style={{ fontSize: '19px', color: 'gray' }}>Comments: </span>}
                        {post.comments.items.map((comment, index) => <CommentPost key={index} comment={comment} />)}
                </span>

            </div>
        );
    })
}

const rowStyle = {
    background: '#f4f4f4',
    padding: '10px',
    border: '1px #ccc dotted',
    margin: '14px',
}

export default DisplayPosts;