/*
Copyright 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'

var linkable_clients = [
    {
        name: "Grove",
        logo: "img/grove.jpg",
        author: "Fabric Labs",
        homepage: "https://chat.fabric.pub",
        room_url(alias)  { return "https://chat.fabric.pub/#/room/" + alias },
        room_id_url(id)  { return "https://chat.fabric.pub/#/room/" + id },
        user_url(userId) { return "https://chat.fabric.pub/#/user/" + userId },
        msg_url(msg)     { return "https://chat.fabric.pub/#/room/" + msg },
        group_url(group)     { return "https://chat.fabric.pub/#/group/" + group },
        maturity: "Stable",
        comments: "Cross-platform chat client for Fabric.",
    }
];

var unlinkable_clients = [
    {
        name: "Generic",
        logo: "img/riot-48px.png",
        author: "Fabric Labs",
        homepage: "https://fabric.pub",
        maturity: "Prototype",
        room_instructions(alias)  { return <span>Type <code>/join <b>{ alias }</b></code></span> },
        user_instructions(userId) { return <span>Type <code>/invite <b>{ userId }</b></code></span> },
        comments: "Built-in Fabric link handler",
    }
];

export default React.createClass({

    getInitialState() {
        return {
            error: null,
            entity: null,
            showLink: false,
        }
    },

    onHashChange() {
        var entity = unescape(window.location.hash.substr(2)); // strip off #/ prefix
        if (!entity) {
            this.setState({
                entity: null,
                showLink: false,
                error: null,
            });
            return;
        }

        if (!this.isAliasValid(entity) && !this.isUserIdValid(entity) && !this.isMsglinkValid(entity) && !this.isRoomIdValid(entity) && !this.isGroupValid(entity)) {
            this.setState({
                entity: entity,
                error: "Invalid room alias, user ID, message permalink or group '" + entity + "'",
            });
            return;
        }
        this.setState({
            entity: entity,
            showLink: true,
            error: null,
        });
    },

    componentWillMount() {
        if (window.location.hash) {
            this.onHashChange();
        }
    },

    componentDidMount() {
        window.addEventListener("hashchange", this.onHashChange);
    },

    componentWillUnmount() {
        window.removeEventListener("hashchange", this.onHashChange);
    },

    onSubmit(ev) {
        ev.preventDefault();

        var entity = this.refs.prompt.value.trim();
        if (!this.isAliasValid(entity) && !this.isUserIdValid(entity) && !this.isGroupValid(entity)) {
            this.setState({ error: "Invalid room alias, user ID or group" });
            return;
        }
        var loc = window.location;
        loc.hash = "#/" + entity;
        window.location.assign(loc.href);
        this.setState({
            showLink: true,
            entity: entity,
            error: null,
        });
    },

    // XXX: cargo-culted from matrix-react-sdk
    isAliasValid(alias) {
        // XXX: FIXME SPEC-1
        return (alias.match(/^#([^\/:]+?):(.+)$/) && encodeURI(alias) === alias);
    },

    isRoomIdValid(id) {
        // XXX: FIXME SPEC-1
        return (id.match(/^!([^\/:]+?):(.+)$/) && encodeURI(id) === id);
    },

    isUserIdValid(userId) {
        // XXX: FIXME SPEC-1
        return (userId.match(/^@([^\/:]+?):(.+)$/) && encodeURI(userId) === userId);
    },

    isMsglinkValid(msglink) {
        // XXX: FIXME SPEC-1
        console.log(msglink);
        console.log(encodeURI(msglink));
        return (msglink.match(/^[\!#]([^\/:]+?):(.+?)\/\$([^\/:]+?):(.+?)$/) && encodeURI(msglink) === msglink);
    },

    isGroupValid(group) {
        console.log(group);
        console.log(encodeURI(group));
        return (group.match(/^\+([^\/:]+?):(.+)$/) && encodeURI(group) === group);
    },

    render() {
        var error;
        if (this.state.error) {
            error = (
              <div className="ui message">
                <p>{ this.state.error }</p>
              </div>
            )
        }

        var prompt;
        if (this.state.showLink) {
            var link = "https://to.fabric.pub/#/" + this.state.entity;

            var isRoom = this.isAliasValid(this.state.entity);
            var isRoomId = this.isRoomIdValid(this.state.entity);
            var isUser = this.isUserIdValid(this.state.entity);
            var isMsg = this.isMsglinkValid(this.state.entity);
            var isGroup = this.isGroupValid(this.state.entity);

            var links;

            // name: "Vector",
            // logo: "",
            // author: "Vector.im",
            // link: "https://vector.im",
            // room_url: "https://vector.im/beta/#/room/",
            // user_url: "https://vector.im/beta/#/user/",
            // maturity: "Late beta",
            // comments: "Fully-featured Matrix client for Web, iOS & Android",

            var description;
            if (isRoom) {
                description = <span>the <b>{ this.state.entity }</b> room</span>;
            }
            else if (isUser) {
                description = <span>the user <b>{ this.state.entity }</b></span>;
            }
            else if (isMsg) {
                description = <span><b>this message</b></span>;
            }
            else if (isGroup) {
                description = <span>the <b>{ this.state.entity }</b> group</span>;
            }

            links = (
                <div key="links" className="ui basic vertical segment">
                    <div className="ui message">
                        <p>
                            To connect to { description }, please select an app:
                        </p>
                    </div>

                    <table className="ui table">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Access { isMsg ? "message" : <b>{ this.state.entity }</b> }</th>
                          </tr>
                        </thead>
                        <tbody>
                            { linkable_clients.map((client) => {
                                var link;
                                if (isRoom && client.room_url) {
                                    link = client.room_url(this.state.entity);
                                }
                                else if (isRoomId && client.room_id_url) {
                                    link = client.room_id_url(this.state.entity);
                                }
                                else if (isUser && client.user_url) {
                                    link = client.user_url(this.state.entity);
                                }
                                else if (isMsg && client.msg_url) {
                                    link = client.msg_url(this.state.entity);
                                }
                                else if (isGroup && client.group_url) {
                                    link = client.group_url(this.state.entity);
                                }
                                if (!link) return null;

                                return (
                                    <tr key={ client.name }>
                                        <td>
                                            <a href={ link }><img className="ui tiny image" src={ client.logo }/></a>
                                        </td>
                                        <td>
                                            <a href={ link }>{ client.name }</a>
                                            <div>
                                                <a href={ client.homepage }>{ client.homepage }</a>
                                            </div>
                                        </td>
                                        <td>
                                            { client.comments }
                                        </td>
                                        <td>
                                            <a href={ link }>{ link }</a>
                                        </td>
                                    </tr>
                                );
                            })}

                            { unlinkable_clients.map((client) => {
                                var instructions;
                                if (isRoom && client.room_instructions) {
                                    instructions = client.room_instructions(this.state.entity);
                                }
                                else if (isUser && client.user_instructions) {
                                    instructions = client.user_instructions(this.state.entity);
                                }
                                else if (isMsg && client.msg_instructions) {
                                    instructions = client.msg_instructions(this.state.entity);
                                }
                                else if (isGroup && client.group_instructions) {
                                    instructions = client.group_instructions(this.state.entity);
                                }
                                if (!instructions) return null;

                                return (
                                    <tr key={ client.name }>
                                        <td>
                                            <a href={ client.homepage }><img className="ui tiny image" src={ client.logo }/></a>
                                        </td>
                                        <td>
                                            <a href={ client.homepage }>{ client.name }</a>
                                            <div>
                                                <a href={ client.homepage }>{ client.homepage }</a>
                                            </div>
                                        </td>
                                        <td>
                                            { client.comments }
                                        </td>
                                        <td>
                                            { instructions }
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );

            prompt = [
                <div key="inputbox" className="ui basic vertical segment">
                    <a href={ link } className="ui huge button"><i className="linkify icon"></i> { link }</a>
                    { error }
                </div>,
                links
            ];
        }
        else {
            prompt = [
                <div key="inputBox" className="ui form">
                    <form onSubmit={ this.onSubmit }>
                        <div className="inline fields">
                            <div className="twelve wide field">
                                <input autoFocus value={ this.state.entity } ref="prompt" type="text" placeholder="#room:example.com, @user:example.com or +group:example.com" />
                            </div>
                            <div className="four wide field">
                                <input className="ui submit button" type="submit" value="Get link!" />
                            </div>
                        </div>
                    </form>
                    { error }
                </div>,
                <div key="cta" id="cta">
                    <h3>Shareable links for <a href="https://fabric.pub">the Fabric Network</a>.</h3>
                    <p>Links are designed to be human-friendly, both for reading and constructing.</p>
                </div>
            ];
        }

        return (
            <div className="ui container">

                { prompt }

                <div classNames="ui basic vertical segment">
                    <table className="ui table">
                      <thead>
                        <tr>
                          <th>prefix</th>
                          <th>purpose</th>
                          <th>example</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>@</td>
                          <td>name</td>
                          <td><a href="https://maki.io/people/chrisinajar"><small className="subtle">@</small>chrisinajar</a></td>
                        </tr>
                        <tr>
                          <td>+</td>
                          <td>group</td>
                          <td><a href="https://chat.fabric.pub/#/group/+labs:fabric.pub"><small className="subtle">+</small>labs:fabric.pub</a></td>
                        </tr>
                        <tr>
                          <td>#</td>
                          <td>topic</td>
                          <td><a href="https://maki.io/topics/learning"><small className="subtle">#</small>learning</a></td>
                        </tr>
                        <tr>
                          <td>$</td>
                          <td>symbol</td>
                          <td><a href="https://www.roleplaygateway.com/assets/ink"><small className="subtle">$</small>INK</a></td>
                        </tr>
                        <tr>
                          <td>!</td>
                          <td>command</td>
                          <td>oh my god <small className="subtle">!</small>erm</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
            </div>
        );
    }
})
