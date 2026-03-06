from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.crud.supplier import (
    get_all_suppliers,
    get_supplier_by_id,
    create_supplier,
    update_supplier,
    delete_supplier
)
from app.models.user import User

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("", response_model=list[SupplierResponse])
def list_suppliers(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_all_suppliers(db)


@router.post("", response_model=SupplierResponse)
def add_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return create_supplier(db, data.name, data.contact, data.email, data.address)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    supplier = get_supplier_by_id(db, supplier_id)
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    return supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
def edit_supplier(
    supplier_id: int,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    supplier = update_supplier(
        db, supplier_id, data.name, data.contact, data.email, data.address
    )
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    return supplier


@router.delete("/{supplier_id}")
def remove_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    success = delete_supplier(db, supplier_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    return {"message": "Supplier deleted successfully"}