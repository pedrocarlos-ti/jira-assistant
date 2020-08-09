import React, { PureComponent } from 'react';
import { inject } from '../services/injector-service';
import BaseGadget, { GadgetActionType } from './BaseGadget';
import { ScrollableTable, THead, TBody, Column, NoDataRow } from '../components/ScrollableTable';
import { showContextMenu } from 'jsd-report';
import { Dialog } from '../dialogs/CommonDialog';
import { TicketDisplay } from '../display-controls';

class MyOpenTickets extends BaseGadget {
    constructor(props) {
        super(props, "My open tickets", "fa-eye");
        inject(this, "JiraService", "BookmarkService", "UserUtilsService");

        this.state.isLoading = true;
        this.state.ticketList = [];
    }

    UNSAFE_componentWillMount() {
        this.refreshData();
    }

    render() {
        const { ticketList } = this.state;

        return super.renderBase(
            <ScrollableTable dataset={ticketList} exportSheetName="My open tickets">
                <THead>
                    <tr>
                        <Column sortBy="ticketNo">Ticket No</Column>
                        <Column sortBy="issuetype">Type</Column>
                        <Column sortBy="summary">Summary</Column>
                        <Column sortBy="reporter">Reporter</Column>
                        <Column sortBy="priority">Priority</Column>
                        <Column sortBy="status">Status</Column>
                        <Column sortBy="resolution">Resolution</Column>
                        <Column sortBy="createdSortable">Created</Column>
                        <Column sortBy="updatedSortable">Updated</Column>
                    </tr>
                </THead>
                <TBody>
                    {(b, i) => <TicketRow key={i} ticket={b} onAddWorklog={this.addWorklogOn} onBookmark={this.bookmarkAdded} />}
                </TBody>
                <NoDataRow span={9}>No open tickets were assigned to you. Enjoy your day!</NoDataRow>
            </ScrollableTable>
        );
    }

    refreshData = (refresh) => {
        this.setState({ isLoading: true });

        this.$jira.getOpenTickets(refresh)
            .then((result) => {
                const ticketList = result.map(t => {
                    const fields = t.fields;
                    return {
                        ticketNo: t.key,
                        ticketUrl: this.$userutils.getTicketUrl(t.key),
                        issuetypeIcon: (fields.issuetype || {}).iconUrl,
                        issuetype: (fields.issuetype || {}).name,
                        summary: fields.summary,
                        reporter: (fields.reporter || {}).displayName,
                        priorityIcon: (fields.priority || {}).iconUrl,
                        priority: (fields.priority || {}).name,
                        statusIcon: (fields.status || {}).iconUrl,
                        status: (fields.status || {}).name,
                        resolutionIcon: (fields.resolution || {}).iconUrl,
                        resolution: (fields.resolution || {}).name,
                        createdSortable: fields.created,
                        updatedSortable: fields.updated,
                        created: this.$userutils.formatDateTime(fields.created),
                        updated: this.$userutils.formatDateTime(fields.updated)
                    };
                });

                this.setState({ ticketList, isLoading: false });
            });
    }

    showContext($event, b) {
        this.selectedTicket = b;
        showContextMenu($event, this.contextMenu);
    }

    bookmarkAdded = () => this.performAction(GadgetActionType.TicketBookmarked);
}

class TicketRow extends PureComponent {
    setRef = (ref) => this.keyCtr = ref;

    render() {
        const { ticket: b, onAddWorklog, onBookmark } = this.props;

        return (
            <tr onContextMenu={(e) => this.keyCtr.showContext(e)}>
                <TicketDisplay ref={this.setRef} value={b.ticketNo} onAddWorklog={onAddWorklog} onBookmark={onBookmark} />
                <td><img className="img-x16" src={b.issuetypeIcon} alt="" />{b.issuetype}</td>
                <td>{b.summary}</td>
                <td>{b.reporter}</td>
                <td><img className="img-x16" src={b.priorityIcon} alt="" />{b.priority}</td>
                <td><img className="img-x16" src={b.statusIcon} alt="" />{b.status}</td>
                <td>{b.resolutionIcon && <img className="img-x16" src={b.resolutionIcon} alt="" />}{b.resolution}</td>
                <td>{b.created}</td>
                <td>{b.updated}</td>
            </tr>
        );
    }
}

export default MyOpenTickets;