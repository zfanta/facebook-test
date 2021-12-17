import React, {useEffect} from 'react';
import './App.css';

const baseUrl = 'https://api-dev.jdjeon.com';

async function login() {
  await fetch(`${baseUrl}/auth/signIn`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@admin.com',
      password: ''
    })
  })
}

async function getCommunity() {
  const communities = await fetch(`${baseUrl}/communities`, {
    credentials: 'include',
  }).then(res => res.json());

  // @ts-ignore
  const community = communities.filter(community => community.name.includes('성동구'))[0]

  return community.id
}

async function getPosts(community: string) {
  const posts = await fetch(`${baseUrl}/communities/${community}/posts`, {
    credentials: 'include',
  }).then(res => res.json())

  return posts.data
}

function App() {
  const [posts, setPosts] = React.useState<any[]>([]);
  const [selectedPosts, setSelectedPosts] = React.useState<string[]>([]);
  const [facebookLoginUrl, setFacebookLoginUrl] = React.useState('');

  function checkHandler(id: string, checked: boolean) {
    if (checked) {
      const set = new Set(selectedPosts)
      set.add(id)
      setSelectedPosts(Array.from(set))
    } else {
      const set = new Set(selectedPosts)
      set.delete(id)
      setSelectedPosts(Array.from(set))
    }
  }

  useEffect(() => {
    login()
      .then(() => getCommunity())
      .then((community) => {
        return getPosts(community)
      })
      .then(posts => {
        setPosts(posts)
      })
  }, [])

  useEffect(() => {
    if (selectedPosts.length === 0) {
      return setFacebookLoginUrl('')
    }
    fetch(`${baseUrl}/facebook/feed`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedPosts.map(selectedPost => ({
        post: selectedPost,
        page: '100378165751007'
      })))
    })
      .then(res => res.json())
      .then(body => {
        console.log(body.url)
        setFacebookLoginUrl(body.url)
      })
  }, [selectedPosts])

  return (
    <div className="App">
      <div>
        {posts.map(post => (
          <div key={post.id}>
            <p>{post.body}</p>
            <label htmlFor={`checkbox-${post.id}`}>발행</label>
            <input
              id={`checkbox-${post.id}`}
              type="checkbox"
              onChange={({target}) => checkHandler(post.id, target.checked)}
            />
          </div>
        ))}
      </div>
      <div>
        {facebookLoginUrl !== '' && (
          <a href={facebookLoginUrl} target="_blank">
            선택한 글 발행
          </a>
        )}
      </div>
    </div>
  );
}

export default App;
