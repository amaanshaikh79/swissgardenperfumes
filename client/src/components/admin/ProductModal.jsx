import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ProductModal.css';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
    const defaultForm = {
        name: '',
        brand: '',
        price: '',
        stock: '',
        category: 'Eau de Parfum',
        gender: 'Unisex',
        size: '100ml',
        description: '',
        fragranceFamily: 'Floral',
        images: [{ url: '', alt: '' }],
        fragranceNotes: { top: '', middle: '', base: '' },
        featured: false,
    };

    const [formData, setFormData] = useState(defaultForm);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                ...defaultForm, // Ensure all fields exist
                ...product,
                fragranceNotes: {
                    top: product.fragranceNotes?.top?.join(', ') || '',
                    middle: product.fragranceNotes?.middle?.join(', ') || '',
                    base: product.fragranceNotes?.base?.join(', ') || '',
                },
                // Ensure at least one image input
                images: product.images?.length ? product.images : [{ url: '', alt: '' }],
            });
        } else {
            setFormData(defaultForm);
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNoteChange = (type, value) => {
        setFormData(prev => ({
            ...prev,
            fragranceNotes: {
                ...prev.fragranceNotes,
                [type]: value
            }
        }));
    };

    const handleImageChange = (index, field, value) => {
        const newImages = [...formData.images];
        newImages[index][field] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, { url: '', alt: '' }]
        }));
    };

    const removeImageField = (index) => {
        if (formData.images.length === 1) {
            handleImageChange(0, 'url', '');
            handleImageChange(0, 'alt', '');
            return;
        }
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data for API
            const submissionData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                fragranceNotes: {
                    top: formData.fragranceNotes.top.split(',').map(s => s.trim()).filter(Boolean),
                    middle: formData.fragranceNotes.middle.split(',').map(s => s.trim()).filter(Boolean),
                    base: formData.fragranceNotes.base.split(',').map(s => s.trim()).filter(Boolean),
                },
                images: formData.images.filter(img => img.url.trim() !== '')
            };

            if (submissionData.images.length === 0) {
                toast.error('Please add at least one product image');
                setLoading(false);
                return;
            }

            await onSave(submissionData);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <form className="modal-content" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="ex. Midnight Rose"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                className="form-input"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                placeholder="ex. Gucci"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                                <option>Eau de Parfum</option>
                                <option>Eau de Toilette</option>
                                <option>Eau de Cologne</option>
                                <option>Parfum</option>
                                <option>Body Mist</option>
                                <option>Gift Set</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                                <option>Unisex</option>
                                <option>Men</option>
                                <option>Women</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                className="form-input"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                className="form-input"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Size</label>
                            <input
                                type="text"
                                name="size"
                                className="form-input"
                                value={formData.size}
                                onChange={handleChange}
                                required
                                placeholder="ex. 100ml"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fragrance Family</label>
                            <select name="fragranceFamily" className="form-select" value={formData.fragranceFamily} onChange={handleChange}>
                                <option>Floral</option>
                                <option>Oriental</option>
                                <option>Woody</option>
                                <option>Fresh</option>
                                <option>Citrus</option>
                                <option>Aquatic</option>
                                <option>Gourmand</option>
                                <option>Chypre</option>
                                <option>Fougere</option>
                                <option>Aromatic</option>
                            </select>
                        </div>

                        <div className="sections-divider">Fragrance Notes (comma separated)</div>

                        <div className="form-group full-width">
                            <label className="form-label">Top Notes</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.fragranceNotes.top}
                                onChange={(e) => handleNoteChange('top', e.target.value)}
                                placeholder="Citrus, Bergamot, Apple"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Middle Notes</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.fragranceNotes.middle}
                                onChange={(e) => handleNoteChange('middle', e.target.value)}
                                placeholder="Rose, Jasmine, Cinnamon"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Base Notes</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.fragranceNotes.base}
                                onChange={(e) => handleNoteChange('base', e.target.value)}
                                placeholder="Vanilla, Musk, Amber"
                            />
                        </div>

                        <div className="sections-divider">Details</div>

                        <div className="form-group full-width">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Product description..."
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    style={{ marginRight: '8px' }}
                                />
                                Mark as Featured Product
                            </label>
                        </div>

                        <div className="sections-divider">Images (URLs)</div>

                        <div className="form-group full-width">
                            {formData.images.map((img, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ flex: 1 }}
                                        value={img.url}
                                        onChange={(e) => handleImageChange(idx, 'url', e.target.value)}
                                        placeholder="Image URL (https://...)"
                                    />
                                    <button type="button" className="btn-secondary" onClick={() => removeImageField(idx)}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn-secondary" onClick={addImageField} style={{ marginTop: '8px' }}>
                                <FiPlus size={14} /> Add Another Image
                            </button>

                            <div className="image-preview-list">
                                {formData.images.map((img, idx) => img.url && (
                                    <div key={idx} className="image-preview">
                                        <img src={img.url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </form>

                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
