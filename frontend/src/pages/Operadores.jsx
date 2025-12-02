import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { operadoresAPI } from '@/services/api'
import { Plus, Edit, Trash2, UserCog, Eye, EyeOff } from 'lucide-react'

export function Operadores() {
    const [operadores, setOperadores] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingOperador, setEditingOperador] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        nome: '',
        documento: '',
        email: '',
        senha: '',
        tipo: 1
    })

    // Carregar operadores ao montar o componente
    useEffect(() => {
        loadOperadores()
    }, [])

    const loadOperadores = async () => {
        try {
            setLoading(true)
            const data = await operadoresAPI.getAll()
            setOperadores(data)
        } catch (error) {
            console.error('Erro ao carregar operadores:', error)
            if (!error.message?.includes('Sessão expirada')) {
                alert('Erro ao carregar operadores')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (operador = null) => {
        if (operador) {
            setEditingOperador(operador)
            setFormData({
                nome: operador.nome,
                documento: operador.documento || '',
                email: operador.email,
                senha: '',
                tipo: operador.tipo || 1
            })
        } else {
            setEditingOperador(null)
            setFormData({
                nome: '',
                documento: '',
                email: '',
                senha: '',
                tipo: 1
            })
        }
        setShowPassword(false)
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)

            if (editingOperador) {
                // Atualizar operador existente
                const { senha, ...dadosSemSenha } = formData
                await operadoresAPI.update(editingOperador.id, dadosSemSenha)

                // Se preencheu senha, atualizar separadamente
                if (senha) {
                    await operadoresAPI.updatePassword(editingOperador.id, senha)
                }
            } else {
                // Criar novo operador
                if (!formData.senha) {
                    alert('Senha é obrigatória para novo operador')
                    return
                }
                await operadoresAPI.create(formData)
            }

            await loadOperadores()
            setIsDialogOpen(false)
            setFormData({ nome: '', documento: '', email: '', senha: '', tipo: 1 })
        } catch (error) {
            console.error('Erro ao salvar operador:', error)
            alert(error.message || 'Erro ao salvar operador')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este operador?')) {
            return
        }

        try {
            setLoading(true)
            await operadoresAPI.delete(id)
            await loadOperadores()
        } catch (error) {
            console.error('Erro ao deletar operador:', error)
            alert('Erro ao deletar operador')
        } finally {
            setLoading(false)
        }
    }

    const formatCPF = (value) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        }
        return value
    }

    return (
        <MainLayout title="Operadores">
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h3 className="text-base sm:text-lg font-medium">Gerenciar Operadores</h3>
                        <p className="text-sm text-muted-foreground">
                            Cadastre e gerencie os usuários do sistema
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto" disabled={loading}>
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Adicionar Operador</span>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <UserCog className="h-5 w-5" />
                            Lista de Operadores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && operadores.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Carregando...</p>
                        ) : operadores.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Nenhum operador cadastrado</p>
                        ) : (
                            <>
                                {/* Versão Desktop - Tabela */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Documento</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {operadores.map((operador) => (
                                                <TableRow key={operador.id}>
                                                    <TableCell className="font-medium">{operador.nome}</TableCell>
                                                    <TableCell>{operador.email}</TableCell>
                                                    <TableCell>{operador.documento || '-'}</TableCell>
                                                    <TableCell>
                                                        <span className={operador.tipo === 1 ? 'text-blue-600 font-medium' : ''}>
                                                            {operador.tipo === 1 ? 'Admin' : 'Operador'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOpenDialog(operador)}
                                                                disabled={loading}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(operador.id)}
                                                                disabled={loading}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Versão Mobile/Tablet - Cards */}
                                <div className="lg:hidden space-y-3">
                                    {operadores.map((operador) => (
                                        <div key={operador.id} className="border rounded-lg p-4 space-y-3">
                                            <div>
                                                <h4 className="font-medium">{operador.nome}</h4>
                                                <p className="text-sm text-muted-foreground">{operador.email}</p>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="font-medium">Documento:</span> {operador.documento || '-'}</p>
                                                <p>
                                                    <span className="font-medium">Tipo:</span>{' '}
                                                    <span className={operador.tipo === 1 ? 'text-blue-600 font-medium' : ''}>
                                                        {operador.tipo === 1 ? 'Admin' : 'Operador'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(operador)}
                                                    className="flex-1"
                                                    disabled={loading}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(operador.id)}
                                                    className="flex-1"
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Excluir
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog de Cadastro/Edição */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent onClose={() => setIsDialogOpen(false)}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingOperador ? 'Editar Operador' : 'Adicionar Operador'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="documento">CPF (opcional)</Label>
                                <Input
                                    id="documento"
                                    value={formData.documento}
                                    onChange={(e) => setFormData({ ...formData, documento: formatCPF(e.target.value) })}
                                    placeholder="000.000.000-00"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="senha">
                                    {editingOperador ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="senha"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.senha}
                                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                        required={!editingOperador}
                                        disabled={loading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo de Usuário</Label>
                                <select
                                    id="tipo"
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded-md"
                                    disabled={loading}
                                >
                                    <option value={1}>Administrador</option>
                                    <option value={0}>Operador</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Salvando...' : editingOperador ? 'Salvar Alterações' : 'Adicionar'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    )
}
