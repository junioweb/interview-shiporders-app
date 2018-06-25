import React, { Component } from 'react';
import { post } from 'axios';
import logo from './s2it.png';
import { Container, Row, Col, Alert, Jumbotron } from 'reactstrap';
import Dropzone from 'react-dropzone';

class Home extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			accepted: [],
			rejected: [],
			processed: [],
			errors: []
		};
		this.onDrop = this.onDrop.bind(this);
		this.fileUpload = this.fileUpload.bind(this);
		this.accessToken = this.accessToken.bind(this);
	}
	
	componentDidMount() {
		if (!localStorage.getItem('token')) {
			this.accessToken();
		}
	}
	
	accessToken() {
		const url = 'http://localhost:8000/oauth/v2/token';
		const data = {
			grant_type: 'password',
			client_id: '1_3bcbxd9e24g0gk4swg0kwgcwg4o8k8g4g888kwc44gcc0gwwk4',
			client_secret: '4ok2x70rlfokc8g0wws8c8kwcokw80k44sg48goc0ok4w0so0k',
			username: 'admin',
			password: 'admin'
		};
		
		post(url, data)
			.then(response => {
				localStorage.setItem('token', response.data.access_token);
			})
			.catch(error => {
				console.log(error.response.data);
			})
	}
	
	fileUpload(file){
		const url = 'http://localhost:8000/uploads';
		const config = {
			headers: {
				'Authorization': 'Bearer ' + localStorage.getItem('token')
			}
		};

		return  post(url, file, config)
	}
	
	submit(){
		this.state.accepted.map(file => (
			this.fileUpload(file)
				.then((response) => {
					this.setState({
						processed: [
							...this.state.processed,
							file
						]
					});
				})
				.catch((error) => {
					if (error.response.status === 401) {
						this.accessToken();
					}
					this.setState({
						errors: [
							...this.state.errors,
							error.response.status + ' - ' + error.response.data.message
						]
					});
				})
		));
	}
	
	onDrop(accepted, rejected) {
		this.setState({ accepted, rejected }, () => this.submit());
	}
	
	render() {
		const styleDrop = {
			"with": "100%",
			"height": "50vh",
			"border-style":"dashed"
		};

		return (
			<div>
				<Container fluid>
					<Jumbotron fluid>
						<Container>
							<img src={logo} className="App-logo" alt="logo" />
							<h1 className="display-5">Zone for upload files of interview-shiporders</h1>
						</Container>
					</Jumbotron>
				</Container>
				<Container>
					<Row>
						<Col>
							<Dropzone accept="text/xml" style={styleDrop} onDrop={this.onDrop}>
								<p>Try dropping some files here, or click to select files to upload.</p>
							</Dropzone>
						</Col>
						<Col>
							<aside>
								<Alert color="danger" isOpen={!!this.state.errors.length}>
									<ul>
										{
											this.state.errors.map((error, key) => <li key={key}>{ error }</li>)
										}
									</ul>
								</Alert>
								<h2>Files processed:</h2>
								<ul>
									{
										this.state.processed.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
									}
								</ul>
							</aside>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Home;