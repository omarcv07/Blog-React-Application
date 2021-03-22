import React from 'react';

const UsersWhoLikedPost = (props) => {
    const { data } = props;
    return data.map(user => {
        return (
            <div key={user}>
                <span style={{ fontStyle: 'bold', color: '#ged' }}>{user}</span>
            </div>
        );
    })
}

export default UsersWhoLikedPost;