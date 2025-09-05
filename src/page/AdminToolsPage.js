import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { 
    getUserManagementList, 
    batchEnableUsers, 
    batchDisableUsers, 
    batchDeleteUsers,
    batchSetAdminRole,
    batchRemoveAdminRole,
    updateUserStatus,
    deleteUser,
    banUser,
    unbanUser,
    setAdminRole,
    removeAdminRole
} from '../api/service';
import Header from './header';
import Footer from './Footer';
import './AdminToolsPage.css';

function AdminToolsPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [adminFilter, setAdminFilter] = useState('all'); // 'all', 'admin', 'non-admin'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'disabled'
    const [loginDateStart, setLoginDateStart] = useState('');
    const [loginDateEnd, setLoginDateEnd] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    
    // 确认弹窗状态管理
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmTitle, setConfirmTitle] = useState('');
    const modalRef = useRef(null);

    // 获取用户数据
    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            
            // 构建查询参数
            const params = {
                pageNum: currentPage,
                pageSize: pageSize
            };
            
            // 添加搜索条件
            if (searchQuery.trim()) {
                // 根据搜索内容判断是用户名、邮箱还是手机号
                if (searchQuery.includes('@')) {
                    params.email = searchQuery.trim();
                } else if (/^\d+$/.test(searchQuery.trim())) {
                    params.phone = searchQuery.trim();
                } else {
                    params.username = searchQuery.trim();
                }
            }
            
            // 添加管理员筛选
            if (adminFilter !== 'all') {
                params.isAdmin = adminFilter === 'admin' ? 1 : 0;
            }
            
            // 添加状态筛选
            if (statusFilter !== 'all') {
                params.isBanned = statusFilter === 'disabled' ? 1 : 0;
            }
            
            // 添加时间范围筛选
            if (loginDateStart) {
                params.startTime = loginDateStart + ' 00:00:00';
            }
            if (loginDateEnd) {
                params.endTime = loginDateEnd + ' 23:59:59';
            }
            
            const response = await getUserManagementList(params);
            
            if (response.data && response.data.code === 200) {
                setUsers(response.data.data.rows || []);
                setTotalCount(response.data.data.total || 0);
            } else {
                message.error(response.data?.msg || t('loadUsersFailed') || '加载用户数据失败');
                setUsers([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error(t('loadUsersFailed') || '加载用户数据失败');
            setUsers([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    // 数据加载
    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize]); // 分页变化时重新加载

    // 搜索实时筛选
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentPage === 1) {
                fetchUsers();
            } else {
                setCurrentPage(1); // 触发上面的useEffect
            }
        }, 500); // 防抖动，500ms后执行搜索
        
        return () => clearTimeout(timeoutId);
    }, [searchQuery]); // 搜索条件变化时触发

    // 点击外部关闭弹窗
    useEffect(() => {
        const handleClickOutsideModal = (event) => {
            if (showConfirmModal && modalRef.current && !modalRef.current.contains(event.target)) {
                setShowConfirmModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideModal);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideModal);
        };
    }, [showConfirmModal]);

    // 弹窗确认函数
    const showConfirm = (title, message, action) => {
        setConfirmTitle(title);
        setConfirmMessage(message);
        setConfirmAction(() => action);
        setShowConfirmModal(true);
    };

    // 确认操作
    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction();
        }
        setShowConfirmModal(false);
    };

    // 取消操作
    const handleCancel = () => {
        setShowConfirmModal(false);
    };

    // 重置筛选条件
    const handleResetFilters = () => {
        setSearchQuery('');
        setAdminFilter('all');
        setStatusFilter('all');
        setLoginDateStart('');
        setLoginDateEnd('');
        setCurrentPage(1);
        setSelectedUsers([]);
        setSelectAll(false);
        // 重置后重新加载数据
        setTimeout(() => {
            fetchUsers();
        }, 100);
    };

    // 应用筛选条件
    const handleApplyFilters = () => {
        setCurrentPage(1);
        setSelectedUsers([]);
        setSelectAll(false);
        fetchUsers();
    };

    // 分页相关变量
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentUsers = users; // 后端已经分页，直接使用users

    // 全选/取消全选
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers([]);
            setSelectAll(false);
        } else {
            const currentUserIds = currentUsers.map(user => user.id);
            setSelectedUsers(currentUserIds);
            setSelectAll(true);
        }
    };

    // 单个用户选择
    const handleUserSelect = (userId) => {
        if (selectedUsers.includes(userId)) {
            const newSelected = selectedUsers.filter(id => id !== userId);
            setSelectedUsers(newSelected);
            setSelectAll(false);
        } else {
            const newSelected = [...selectedUsers, userId];
            setSelectedUsers(newSelected);
            if (newSelected.length === currentUsers.length) {
                setSelectAll(true);
            }
        }
    };

    // 批量启用用户
    const handleBatchEnable = async () => {
        if (selectedUsers.length === 0) return;
        
        showConfirm(
            t('confirmBatchEnable') || '批量启用确认',
            t('confirmBatchEnableMessage', { count: selectedUsers.length }) || `确定要启用选中的 ${selectedUsers.length} 个用户吗？`,
            async () => {
                try {
                    const response = await batchEnableUsers(selectedUsers);
                    if (response.data && response.data.code === 200) {
                        message.success(t('batchEnableSuccess') || '批量启用成功');
                        setSelectedUsers([]);
                        setSelectAll(false);
                        fetchUsers(); // 重新加载数据
                    } else {
                        message.error(response.data?.msg || t('batchEnableFailed') || '批量启用失败');
                    }
                } catch (error) {
                    console.error('Batch enable error:', error);
                    message.error(t('batchEnableFailed') || '批量启用失败');
                }
            }
        );
    };

    // 批量禁用用户
    const handleBatchDisable = async () => {
        if (selectedUsers.length === 0) return;
        
        showConfirm(
            t('confirmBatchDisable') || '批量禁用确认',
            t('confirmBatchDisableMessage', { count: selectedUsers.length }) || `确定要禁用选中的 ${selectedUsers.length} 个用户吗？`,
            async () => {
                try {
                    const response = await batchDisableUsers(selectedUsers);
                    if (response.data && response.data.code === 200) {
                        message.success(t('batchDisableSuccess') || '批量禁用成功');
                        setSelectedUsers([]);
                        setSelectAll(false);
                        fetchUsers(); // 重新加载数据
                    } else {
                        message.error(response.data?.msg || t('batchDisableFailed') || '批量禁用失败');
                    }
                } catch (error) {
                    console.error('Batch disable error:', error);
                    message.error(t('batchDisableFailed') || '批量禁用失败');
                }
            }
        );
    };
    // 批量删除用户
    const handleBatchDelete = async () => {
        if (selectedUsers.length === 0) return;
        
        showConfirm(
            t('confirmBatchDelete') || '批量删除确认',
            t('confirmBatchDeleteMessage', { count: selectedUsers.length }) || `确定要删除选中的 ${selectedUsers.length} 个用户吗？此操作不可恢复！`,
            async () => {
                try {
                    const response = await batchDeleteUsers(selectedUsers);
                    if (response.data && response.data.code === 200) {
                        message.success(t('batchDeleteSuccess') || '批量删除成功');
                        setSelectedUsers([]);
                        setSelectAll(false);
                        fetchUsers(); // 重新加载数据
                    } else {
                        message.error(response.data?.msg || t('batchDeleteFailed') || '批量删除失败');
                    }
                } catch (error) {
                    console.error('Batch delete error:', error);
                    message.error(t('batchDeleteFailed') || '批量删除失败');
                }
            }
        );
    };

    // 批量设置管理员权限
    const handleBatchSetAdmin = async () => {
        if (selectedUsers.length === 0) return;
        
        showConfirm(
            t('confirmBatchSetAdmin') || '批量设置管理员确认',
            t('confirmBatchSetAdminMessage', { count: selectedUsers.length }) || `确定要将选中的 ${selectedUsers.length} 个用户设置为管理员吗？`,
            async () => {
                try {
                    const response = await batchSetAdminRole(selectedUsers);
                    if (response.data && response.data.code === 200) {
                        message.success(t('batchSetAdminSuccess') || '批量设置管理员成功');
                        setSelectedUsers([]);
                        setSelectAll(false);
                        fetchUsers(); // 重新加载数据
                    } else {
                        message.error(response.data?.msg || t('batchSetAdminFailed') || '批量设置管理员失败');
                    }
                } catch (error) {
                    console.error('Batch set admin error:', error);
                    message.error(t('batchSetAdminFailed') || '批量设置管理员失败');
                }
            }
        );
    };

    // 批量取消管理员权限
    const handleBatchRemoveAdmin = async () => {
        if (selectedUsers.length === 0) return;
        
        showConfirm(
            t('confirmBatchRemoveAdmin') || '批量取消管理员确认',
            t('confirmBatchRemoveAdminMessage', { count: selectedUsers.length }) || `确定要取消选中的 ${selectedUsers.length} 个用户的管理员权限吗？`,
            async () => {
                try {
                    const response = await batchRemoveAdminRole(selectedUsers);
                    if (response.data && response.data.code === 200) {
                        message.success(t('batchRemoveAdminSuccess') || '批量取消管理员成功');
                        setSelectedUsers([]);
                        setSelectAll(false);
                        fetchUsers(); // 重新加载数据
                    } else {
                        message.error(response.data?.msg || t('batchRemoveAdminFailed') || '批量取消管理员失败');
                    }
                } catch (error) {
                    console.error('Batch remove admin error:', error);
                    message.error(t('batchRemoveAdminFailed') || '批量取消管理员失败');
                }
            }
        );
    };

    // 导出选中用户
    const handleBatchExport = () => {
        if (selectedUsers.length === 0) return;
        
        const selectedUsersData = users.filter(user => selectedUsers.includes(user.id));
        const csvContent = [
            ['ID', '用户名', '邮箱', '手机号', '角色', '状态', '创建时间', '更新时间'],
            ...selectedUsersData.map(user => [
                user.id,
                user.username,
                user.email || '',
                user.phone || '',
                user.isAdminText || (user.isAdmin === 1 ? '管理员' : '普通用户'),
                user.isBannedText || (user.isBanned === 0 ? '正常' : '禁用'),
                user.createTime || '',
                user.updateTime || ''
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 处理管理员权限切换
    const handleAdminToggle = async (userId) => {
        try {
            const user = users.find(u => u.id === userId);
            if (!user) return;
            
            let response;
            let successMessage;
            
            if (user.isAdmin === 1) {
                // 当前是管理员，执行取消管理员权限
                response = await removeAdminRole(userId);
                successMessage = t('removeAdminSuccess') || '取消管理员权限成功';
            } else {
                // 当前不是管理员，执行设置管理员权限
                response = await setAdminRole(userId);
                successMessage = t('setAdminSuccess') || '设置管理员权限成功';
            }
            
            if (response.data && response.data.code === 200) {
                message.success(successMessage);
                fetchUsers(); // 重新加载数据
            } else {
                message.error(response.data?.msg || t('adminRoleUpdateFailed') || '管理员权限更新失败');
            }
        } catch (error) {
            console.error('Admin role toggle error:', error);
            message.error(t('adminRoleUpdateFailed') || '管理员权限更新失败');
        }
    };

    // 处理用户状态切换
    const handleStatusToggle = async (userId) => {
        try {
            const user = users.find(u => u.id === userId);
            if (!user) return;
            
            let response;
            let successMessage;
            
            if (user.isBanned === 1) {
                // 当前被禁用，执行解封操作
                response = await unbanUser(userId);
                successMessage = t('enableSuccess') || '解封成功';
            } else {
                // 当前正常，执行封禁操作
                response = await banUser(userId);
                successMessage = t('disableSuccess') || '封禁成功';
            }
            
            if (response.data && response.data.code === 200) {
                message.success(successMessage);
                fetchUsers(); // 重新加载数据
            } else {
                message.error(response.data?.msg || t('statusUpdateFailed') || '状态更新失败');
            }
        } catch (error) {
            console.error('Status toggle error:', error);
            message.error(t('statusUpdateFailed') || '状态更新失败');
        }
    };

    // 删除用户
    const handleDeleteUser = async (userId) => {
        showConfirm(
            t('confirmDelete') || '删除确认',
            t('confirmDeleteUser') || '确定要删除此用户吗？',
            async () => {
                try {
                    const response = await deleteUser(userId);
                    if (response.data && response.data.code === 200) {
                        message.success(t('deleteSuccess') || '删除成功');
                        fetchUsers(); // 重新加载数据
                    } else {
                        message.error(response.data?.msg || t('deleteFailed') || '删除失败');
                    }
                } catch (error) {
                    console.error('Delete user error:', error);
                    message.error(t('deleteFailed') || '删除失败');
                }
            }
        );
    };

    // 分页按钮生成
    const generatePagination = () => {
        if (totalPages <= 0) {
            return [];
        }
        
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
                pages.push(i);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pages.push('...');
            }
        }
        return [...new Set(pages)];
    };

    return (
        <div>
            <Helmet>
                <title>{t('adminTools') || '管理员工具'}</title>
            </Helmet>
            <Header />
            
            <div className="admin-tools-container">
                <div className="admin-tools-header">
                    <h1>{t('adminTools') || '管理员工具'}</h1>
                    <p>{t('userManagement') || '用户管理'}</p>
                </div>

                <div className="admin-tools-content">
                    {/* 搜索栏 */}
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder={t('searchUsers') || '搜索用户（用户名、邮箱、手机号、角色）'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* 筛选条件 */}
                    <div className="filter-section">
                        <div className="filter-group">
                            <label className="filter-label">{t('adminFilter') || '管理员筛选'}</label>
                            <select 
                                className="filter-select" 
                                value={adminFilter} 
                                onChange={(e) => setAdminFilter(e.target.value)}
                            >
                                <option value="all">{t('all') || '全部'}</option>
                                <option value="admin">{t('adminOnly') || '仅管理员'}</option>
                                <option value="non-admin">{t('nonAdminOnly') || '非管理员'}</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label className="filter-label">{t('statusFilter') || '状态筛选'}</label>
                            <select 
                                className="filter-select" 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">{t('all') || '全部'}</option>
                                <option value="active">{t('activeOnly') || '仅活跃'}</option>
                                <option value="disabled">{t('disabledOnly') || '仅禁用'}</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label className="filter-label">{t('loginDateRange') || '登录时间范围'}</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    className="filter-date"
                                    value={loginDateStart}
                                    onChange={(e) => setLoginDateStart(e.target.value)}
                                />
                                <span>至</span>
                                <input
                                    type="date"
                                    className="filter-date"
                                    value={loginDateEnd}
                                    onChange={(e) => setLoginDateEnd(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="filter-actions">
                            <button className="filter-btn apply" onClick={handleApplyFilters}>
                                {t('applyFilter') || '应用筛选'}
                            </button>
                            <button className="filter-btn reset" onClick={handleResetFilters}>
                                {t('resetFilter') || '重置筛选'}
                            </button>
                        </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="stats-section">
                        <div className="stat-item">
                            <span className="stat-label">{t('totalUsers') || '总用户数'}:</span>
                            <span className="stat-value">{totalCount}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">{t('activeUsers') || '活跃用户'}:</span>
                            <span className="stat-value">{users.filter(u => u.isBanned === 0).length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">{t('disabledUsers') || '禁用用户'}:</span>
                            <span className="stat-value">{users.filter(u => u.isBanned === 1).length}</span>
                        </div>
                    </div>

                    {/* 用户列表 */}
                    {isLoading ? (
                        <div className="loading">{t('loading') || '加载中'}...</div>
                    ) : (
                        <>
                            {/* 批量操作栏 */}
                            {selectedUsers.length > 0 && (
                                <div className="batch-operations">
                                    <div className="batch-info">
                                        {t('selectedCount') || '已选中'}: {selectedUsers.length} {t('users') || '个用户'}
                                    </div>
                                    <div className="batch-actions">
                                        <button 
                                            className="batch-btn enable-batch" 
                                            onClick={handleBatchEnable}
                                            disabled={selectedUsers.length === 0}
                                        >
                                            {t('batchEnable') || '批量启用'}
                                        </button>
                                        <button 
                                            className="batch-btn disable-batch" 
                                            onClick={handleBatchDisable}
                                            disabled={selectedUsers.length === 0}
                                        >
                                            {t('batchDisable') || '批量禁用'}
                                        </button>
                                        <button 
                                            className="batch-btn set-admin-batch" 
                                            onClick={handleBatchSetAdmin}
                                            disabled={selectedUsers.length === 0}
                                        >
                                            {t('batchSetAdmin') || '批量设为管理员'}
                                        </button>
                                        <button 
                                            className="batch-btn remove-admin-batch" 
                                            onClick={handleBatchRemoveAdmin}
                                            disabled={selectedUsers.length === 0}
                                        >
                                            {t('batchRemoveAdmin') || '批量取消管理员'}
                                        </button>
                                        <button 
                                            className="batch-btn delete-batch" 
                                            onClick={handleBatchDelete}
                                            disabled={selectedUsers.length === 0}
                                        >
                                            {t('batchDelete') || '批量删除'}
                                        </button>
                                        <button 
                                            className="batch-btn export-batch" 
                                            onClick={handleBatchExport}
                                            disabled={selectedUsers.length === 0}
                                        >
                                            {t('batchExport') || '导出数据'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="users-table-container">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th className="checkbox-cell">
                                                <div className="select-all-header">
                                                    <input
                                                        type="checkbox"
                                                        className="select-all-checkbox"
                                                        checked={selectAll}
                                                        onChange={handleSelectAll}
                                                    />
                                                    <span>{t('selectAll') || '全选'}</span>
                                                </div>
                                            </th>
                                            <th>{t('id') || 'ID'}</th>
                                            <th>{t('username') || '用户名'}</th>
                                            <th>{t('email') || '邮箱'}</th>
                                            <th>{t('phone') || '手机号'}</th>
                                            <th>{t('role') || '角色'}</th>
                                            <th>{t('status') || '状态'}</th>
                                            <th>{t('updateTime') || '更新时间'}</th>
                                            <th>{t('actions') || '操作'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                                                    {t('noUsersFound') || '暂无用户数据'}
                                                </td>
                                            </tr>
                                        ) : (
                                            currentUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="checkbox-cell">
                                                        <input
                                                            type="checkbox"
                                                            className="user-checkbox"
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={() => handleUserSelect(user.id)}
                                                        />
                                                    </td>
                                                    <td>{user.id}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.email || ''}</td>
                                                    <td>{user.phone || ''}</td>
                                                    <td>
                                                        <span className={`role ${user.isAdmin === 1 ? 'admin' : 'normal-user'}`}>
                                                            {user.isAdminText || (user.isAdmin === 1 ? '管理员' : '普通用户')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status ${user.isBanned === 0 ? 'active' : 'disabled'}`}>
                                                            {user.isBannedText || (user.isBanned === 0 ? '正常' : '禁用')}
                                                        </span>
                                                    </td>
                                                    <td>{user.updateTime || '未知'}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className={`action-btn ${user.isAdmin === 1 ? 'remove-admin' : 'set-admin'}`}
                                                                onClick={() => handleAdminToggle(user.id)}
                                                            >
                                                                {user.isAdmin === 1 ? (t('removeAdmin') || '取消管理员') : (t('setAdmin') || '设为管理员')}
                                                            </button>
                                                            <button
                                                                className={`action-btn ${user.isBanned === 0 ? 'disable' : 'enable'}`}
                                                                onClick={() => handleStatusToggle(user.id)}
                                                            >
                                                                {user.isBanned === 0 ? (t('disable') || '禁用') : (t('enable') || '启用')}
                                                            </button>
                                                            <button
                                                                className="action-btn delete"
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                {t('delete') || '删除'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* 分页 */}
                            <div className="pagination-section">
                                <div className="pagination-info">
                                    {totalCount > 0 ? (
                                        `${t('showingResults') || '显示'} ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} ${t('of') || '/'} ${totalCount} ${t('results') || '结果'}`
                                    ) : (
                                        `${t('showingResults') || '显示'} 0 ${t('results') || '结果'}`
                                    )}
                                </div>
                                <div className="pagination">
                                    {generatePagination().map((page, index) => (
                                        <button
                                            key={index}
                                            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                                            onClick={() => page !== '...' && setCurrentPage(page)}
                                            disabled={page === '...'}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <div className="page-size-selector">
                                    <label>
                                        {t('perPage') || '每页显示'}:
                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setCurrentPage(1);
                                                // 在后续的useEffect中会自动重新加载数据
                                            }}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <Footer />

            {/* 确认弹窗 */}
            {showConfirmModal && (
                <>
                    {/* 背景遮罩 */}
                    <div className="modal-overlay"></div>

                    {/* 弹窗内容 */}
                    <div className="confirm-modal" ref={modalRef}>
                        <div className="modal-header">
                            <ExclamationCircleOutlined className="warning-icon" />
                            <h3>{confirmTitle}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{confirmMessage}</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-btn cancel-btn"
                                onClick={handleCancel}
                            >
                                {t('cancel') || '取消'}
                            </button>
                            <button
                                className="modal-btn confirm-btn"
                                onClick={handleConfirm}
                            >
                                {t('confirm') || '确认'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminToolsPage;