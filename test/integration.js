// import Aria2 from '..'
// import sinon from 'sinon'
// import sinonChai from 'sinon-chai'
// import chai from 'chai'
// const expect = chai.expect

// chai.use(sinonChai)

// describe('Aria2', () => {

//   let client

//   beforeEach(function() {
//     client = new Aria2()
//   })

//   it('should be an instance of Aria2', () => {
//     expect(client).to.be.an.instanceOf(Aria2)
//   })

//   describe('instance properties', () => {

//     it('should have a lastId number property', () => {
//       expect(client.lastId).to.be.a('number')
//       expect(client.lastId).to.equal(0)
//     })

//     it('should have a callback hash property', () => {
//       expect(client.callbacks).to.be.a('object')
//     })

//     it('should have default options properties', () => {
//       for (const i in Aria2.options) {
//         expect(client[i]).to.equal(Aria2.options[i])
//       }
//     })

//     it('should have a function property for each events', () => {
//       Aria2.events.forEach((event) => {
//         expect(client[event]).to.be.a('function')
//       })
//     })

//     it('should have a function property for each methods', () => {
//       Aria2.methods.forEach((method) => {
//         expect(client[method]).to.be.a('function')
//       })
//     })

//     it('should have a function property for each notifications', () => {
//       Aria2.notifications.forEach((notification) => {
//         expect(client[notification]).to.be.a('function')
//       })
//     })
//   })

//   describe('instance methods', () => {

//     describe('send', () => {

//       it('throws a TypeError if method is not a string', () => {
//         expect(client.send.bind(client, null)).to.throw(TypeError)
//       })

//       it('should call onsend once with one argument', () => {
//         const spy = sinon.spy(client, 'onsend')
//         client.send('barfoo')
//         expect(spy).to.have.been.calledOnce
//         expect(spy.args[0].length).to.equal(1)
//       })

//       it('should add lastId to the computed message and increment it', () => {
//         const spy = sinon.spy(client, 'onsend')
//         const lastId = client.lastId
//         client.send('barfoo')
//         expect(spy.args[0][0]).to.have.deep.property('id', lastId)
//         expect(client.lastId).to.equal(lastId + 1)
//       })

//       it('should prefix the method with "aria2."', () => {
//         const spy = sinon.spy(client, 'onsend')
//         client.send('foobar')
//         expect(spy.args[0][0].method).to.equal('aria2.foobar')
//       })

//       it('should add json-rpc property to the computed message', () => {
//         const spy = sinon.spy(client, 'onsend')
//         client.send('foobar')
//         expect(spy.args[0][0]['json-rpc']).to.equal('2.0')
//       })

//       it('should compute arguments > 1 into an array and assign it to the params property', () => {
//         const spy = sinon.spy(client, 'onsend')
//         client.send('foobar', 'far', 'boo')
//         expect(spy.args[0][0].params).to.be.an('array')
//         expect(spy.args[0][0].params).to.deep.equal(['far', 'boo'])
//       })

//       it('should add the secret token to params if defined', () => {
//         const spy = sinon.spy(client, 'onsend')
//         client.secret = 'oo'
//         client.send('foobar', 'far', 'boo')
//         expect(spy.args[0][0].params[0]).to.equal('token:oo')
//       })

//       it('should add the function argument to callbacks', () => {
//         const spy = sinon.spy(client, 'onsend')
//         client.secret = 'oo'
//         const cb = function() {}
//         client.send('foobar', 'foo', 'bar', cb)
//         expect(spy.args[0][0].params).to.be.an('array')
//         expect(spy.args[0][0].params).to.deep.equal(['token:oo', 'foo', 'bar'])
//         const id = spy.args[0][0].id
//         expect(client.callbacks[id]).to.equal(cb)
//       })
//     })

//     describe('_onmessage', () => {

//       it('should call the notification function once with correct arguments when receiving a notification', () => {
//         Aria2.notifications.forEach((notification) => {
//           const spy = sinon.spy(client, notification)
//           const message = {'method': 'aria2.' + notification, 'params': ['foo', 'bar']}
//           client._onmessage(message)

//           expect(spy).to.have.been.calledOnce
//           expect(spy).to.have.been.calledWith('foo', 'bar')
//         })
//       })

//       it('should call the callback of a request when receiving a response', () => {
//         const spySend = sinon.spy(client, 'onsend')
//         const callback = sinon.spy()
//         client.send('foobar', callback)
//         const id = spySend.args[0][0].id
//         expect(client.callbacks[id]).to.equal(callback)
//         const message = {'method': 'aria2.foobar', id}
//         client._onmessage(message)

//         expect(callback).to.have.been.calledOnce
//       })

//       it('should call and delete the callback of a request with error when receiving a response with error', () => {
//         const spySend = sinon.spy(client, 'onsend')
//         const callback = sinon.spy()
//         client.send('foobar', callback)
//         const id = spySend.args[0][0].id
//         expect(client.callbacks[id]).to.equal(callback)
//         const message = {'method': 'aria2.foobar', id, 'error': 'whatever'}
//         client._onmessage(message)

//         expect(callback).to.have.been.calledWith('whatever')
//         expect(client.callbacks[id]).to.equal(undefined)
//       })

//       it('should call and delete the callback of a request with result when receiving a response with result', () => {
//         const spySend = sinon.spy(client, 'onsend')
//         const callback = sinon.spy()
//         client.send('foobar', callback)
//         const id = spySend.args[0][0].id
//         expect(client.callbacks[id]).to.equal(callback)
//         const message = {
//           id,
//           'method': 'aria2.foobar',
//           'result': 'foobar',
//         }
//         client._onmessage(message)

//         expect(callback).to.have.been.calledWith(null, 'foobar')
//         expect(client.callbacks[id]).to.equal(undefined)
//       })
//     })

//     describe('aria2 methods', () => {

//       it('should call send once with correct arguments for each methods function', () => {
//         const spy = sinon.spy(client, 'send')
//         Aria2.methods.forEach(function(method) {
//           client[method]('foo', 'bar')
//           expect(spy).to.have.been.calledWith(method, 'foo', 'bar')
//         })
//       })
//     })
//   })
// })
